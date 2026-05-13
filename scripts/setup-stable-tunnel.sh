#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
RUNTIME_DIR="$ROOT_DIR/.demo-runtime"
CLOUDFLARED_BIN="${CLOUDFLARED_BIN:-/home/danil/cloudflared-bin}"
TUNNEL_NAME="${TUNNEL_NAME:-nemilk-demo}"
DOMAIN="${DOMAIN:-nemilk.ru}"
CONFIG_FILE="$RUNTIME_DIR/cloudflared-config.yml"
TUNNEL_INFO_FILE="$RUNTIME_DIR/tunnel-info.env"
CF_DIR="${HOME}/.cloudflared"

mkdir -p "$RUNTIME_DIR" "$CF_DIR"

log() {
  printf '[setup-stable-tunnel] %s\n' "$1"
}

cloudflared() {
  "$CLOUDFLARED_BIN" "$@"
}

if [[ ! -x "$CLOUDFLARED_BIN" ]]; then
  log "Не найден cloudflared: $CLOUDFLARED_BIN"
  exit 1
fi

if [[ ! -f "$CF_DIR/cert.pem" ]]; then
  log "Сейчас откроется авторизация Cloudflare. Войди в аккаунт, где будет домен ${DOMAIN}."
  cloudflared tunnel login
fi

if ! cloudflared tunnel list 2>/dev/null | grep -q "$TUNNEL_NAME"; then
  log "Создаю tunnel ${TUNNEL_NAME}"
  cloudflared tunnel create "$TUNNEL_NAME"
fi

TUNNEL_ID="$(cloudflared tunnel list 2>/dev/null | awk -v name="$TUNNEL_NAME" '$2 == name { print $1; exit }')"

if [[ -z "$TUNNEL_ID" ]]; then
  log "Не удалось получить tunnel id для ${TUNNEL_NAME}"
  exit 1
fi

CREDENTIALS_FILE="$CF_DIR/${TUNNEL_ID}.json"
if [[ ! -f "$CREDENTIALS_FILE" ]]; then
  log "Не найден файл credentials: $CREDENTIALS_FILE"
  exit 1
fi

log "Привязываю DNS ${DOMAIN} -> tunnel ${TUNNEL_NAME}"
cloudflared tunnel route dns "$TUNNEL_NAME" "$DOMAIN"

cat >"$CONFIG_FILE" <<EOF
tunnel: ${TUNNEL_ID}
credentials-file: ${CREDENTIALS_FILE}

ingress:
  - hostname: ${DOMAIN}
    service: http://127.0.0.1:3002
  - service: http_status:404
EOF

cat >"$TUNNEL_INFO_FILE" <<EOF
TUNNEL_NAME=${TUNNEL_NAME}
TUNNEL_ID=${TUNNEL_ID}
DOMAIN=${DOMAIN}
CONFIG_FILE=${CONFIG_FILE}
EOF

log "Готово"
printf 'Tunnel name: %s\n' "$TUNNEL_NAME"
printf 'Tunnel id: %s\n' "$TUNNEL_ID"
printf 'Domain: %s\n' "$DOMAIN"
printf 'Config: %s\n' "$CONFIG_FILE"
printf '%s\n' "Если домен ещё не перенесён под Cloudflare DNS, сначала добавь сайт в Cloudflare и смени NS у регистратора."
