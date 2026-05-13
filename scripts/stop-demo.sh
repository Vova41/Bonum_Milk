#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
RUNTIME_DIR="$ROOT_DIR/.demo-runtime"
NEXT_PID_FILE="$RUNTIME_DIR/next.pid"
CLOUDFLARED_PID_FILE="$RUNTIME_DIR/cloudflared.pid"
PORT="${PORT:-3002}"

stop_pid_file() {
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

stop_pid_file "$CLOUDFLARED_PID_FILE"
stop_pid_file "$NEXT_PID_FILE"

ss -ltnp 2>/dev/null | awk -v port=":${PORT}" '
  index($4, port) || index($5, port) {
    while (match($0, /pid=[0-9]+/)) {
      print substr($0, RSTART + 4, RLENGTH - 4)
      $0 = substr($0, RSTART + RLENGTH)
    }
  }
' | sort -u | while IFS= read -r pid; do
  [[ -z "$pid" ]] && continue
  kill "$pid" 2>/dev/null || true
done

printf '[stop-demo] Остановлено\n'
