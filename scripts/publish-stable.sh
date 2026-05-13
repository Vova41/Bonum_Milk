#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
RUNTIME_DIR="$ROOT_DIR/.demo-runtime"
NEXT_PID_FILE="$RUNTIME_DIR/next.pid"
CLOUDFLARED_PID_FILE="$RUNTIME_DIR/cloudflared.pid"
NEXT_LOG_FILE="$RUNTIME_DIR/next.log"
CLOUDFLARED_LOG_FILE="$RUNTIME_DIR/cloudflared.log"
CONFIG_FILE="$RUNTIME_DIR/cloudflared-config.yml"
TUNNEL_INFO_FILE="$RUNTIME_DIR/tunnel-info.env"
PORT="${PORT:-3002}"
HOST="${HOST:-127.0.0.1}"
CLOUDFLARED_BIN="${CLOUDFLARED_BIN:-/home/danil/cloudflared-bin}"

mkdir -p "$RUNTIME_DIR"
cd "$ROOT_DIR"

log() {
  printf '[publish-stable] %s\n' "$1"
}

cloudflared() {
  ALL_PROXY=socks5://127.0.0.1:10808 "$CLOUDFLARED_BIN" "$@"
}

cleanup_pid_file() {
  local pid_file="$1"

  if [[ ! -f "$pid_file" ]]; then
    return 0
  fi

  local pid
  pid="$(cat "$pid_file")"

  if [[ -n "$pid" ]] && kill -0 "$pid" 2>/dev/null; then
    kill "$pid" 2>/dev/null || true
    sleep 1
    if kill -0 "$pid" 2>/dev/null; then
      kill -9 "$pid" 2>/dev/null || true
    fi
  fi

  rm -f "$pid_file"
}

find_port_pids() {
  local port="$1"

  ss -ltnp 2>/dev/null | awk -v port=":${port}" '
    index($4, port) || index($5, port) {
      while (match($0, /pid=[0-9]+/)) {
        print substr($0, RSTART + 4, RLENGTH - 4)
        $0 = substr($0, RSTART + RLENGTH)
      }
    }
  ' | sort -u
}

cleanup_port() {
  local port="$1"
  local pids

  pids="$(find_port_pids "$port" || true)"
  if [[ -z "$pids" ]]; then
    return 0
  fi

  while IFS= read -r pid; do
    [[ -z "$pid" ]] && continue
    kill "$pid" 2>/dev/null || true
  done <<<"$pids"

  sleep 1

  pids="$(find_port_pids "$port" || true)"
  if [[ -n "$pids" ]]; then
    while IFS= read -r pid; do
      [[ -z "$pid" ]] && continue
      kill -9 "$pid" 2>/dev/null || true
    done <<<"$pids"
  fi
}

wait_for_http() {
  local url="$1"
  local retries="${2:-60}"
  local delay="${3:-1}"

  for _ in $(seq 1 "$retries"); do
    if curl -fsS "$url" >/dev/null 2>&1; then
      return 0
    fi
    sleep "$delay"
  done

  return 1
}

shutdown() {
  cleanup_pid_file "$CLOUDFLARED_PID_FILE"
  cleanup_pid_file "$NEXT_PID_FILE"
}

trap 'shutdown' EXIT INT TERM

if [[ ! -f "$CONFIG_FILE" || ! -f "$TUNNEL_INFO_FILE" ]]; then
  log "Сначала выполни: npm run tunnel:setup"
  exit 1
fi

source "$TUNNEL_INFO_FILE"

cleanup_pid_file "$CLOUDFLARED_PID_FILE"
cleanup_pid_file "$NEXT_PID_FILE"
cleanup_port "$PORT"
rm -f "$NEXT_LOG_FILE" "$CLOUDFLARED_LOG_FILE"

log "Собираю production build"
npm run build

log "Запускаю Next.js на ${HOST}:${PORT}"
node_modules/.bin/next start -H "$HOST" -p "$PORT" >"$NEXT_LOG_FILE" 2>&1 &
echo "$!" >"$NEXT_PID_FILE"

if ! wait_for_http "http://127.0.0.1:${PORT}" 90 1; then
  log "Next.js не поднялся. Логи:"
  tail -n 40 "$NEXT_LOG_FILE" || true
  exit 1
fi

log "Поднимаю named tunnel ${TUNNEL_NAME}"
cloudflared tunnel --protocol http2 --config "$CONFIG_FILE" run "$TUNNEL_NAME" >"$CLOUDFLARED_LOG_FILE" 2>&1 &
echo "$!" >"$CLOUDFLARED_PID_FILE"

sleep 5

if ! kill -0 "$(cat "$CLOUDFLARED_PID_FILE")" 2>/dev/null; then
  log "Tunnel завершился сразу. Логи:"
  tail -n 60 "$CLOUDFLARED_LOG_FILE" || true
  exit 1
fi

log "Готово"
printf 'Публичный URL: https://%s\n' "$DOMAIN"
printf 'Логи Next.js: %s\n' "$NEXT_LOG_FILE"
printf 'Логи Tunnel: %s\n' "$CLOUDFLARED_LOG_FILE"
printf '%s\n' "Держи этот терминал открытым. Остановить публикацию: Ctrl+C"

wait "$(cat "$CLOUDFLARED_PID_FILE")"
