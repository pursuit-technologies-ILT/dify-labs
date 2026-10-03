#!/usr/bin/env bash
# Start a Cloudflare quick tunnel to local Dify nginx (no account required).
# Prints the https://*.trycloudflare.com URL when it appears.
set -euo pipefail

source "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/lib.sh"
load_lab_env

PORT="${DIFY_HOST_PORT:-3847}"
BIN="${CLOUDFLARED_BIN:-}"

if [[ -z "$BIN" ]]; then
  if command -v cloudflared >/dev/null 2>&1; then
    BIN="$(command -v cloudflared)"
  elif [[ -x "$LAB_ROOT/.local/bin/cloudflared" ]]; then
    BIN="$LAB_ROOT/.local/bin/cloudflared"
  fi
fi

if [[ -z "$BIN" ]]; then
  echo "error: cloudflared not on PATH. Install a Linux amd64 binary into .local/bin/cloudflared." >&2
  exit 1
fi

echo "==> Tunneling http://localhost:${PORT} with ${BIN}"
echo "    Leave this process running. Teardown by ~2026-10-06."
exec "$BIN" tunnel --url "http://localhost:${PORT}" --protocol http2
