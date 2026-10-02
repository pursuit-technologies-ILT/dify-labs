#!/usr/bin/env bash
# Bring up the lab stack. Requires Docker. Operator keys live in repo .env only.
set -euo pipefail

# shellcheck source=lib.sh
source "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/lib.sh"

if [[ ! -f "$LAB_ROOT/.env" ]]; then
  echo "No .env found. Creating from .env.example — add OPENROUTER_API_KEY when ready."
  cp "$LAB_ROOT/.env.example" "$LAB_ROOT/.env"
fi

load_lab_env
cd "$LAB_ROOT"

case "$LAB_MODE" in
  full | dify | webui) ;;
  *)
    echo "error: unknown LAB_MODE=$LAB_MODE (use full|dify|webui)" >&2
    exit 1
    ;;
esac

"$LAB_ROOT/scripts/ensure-docker.sh"
"$LAB_ROOT/scripts/bootstrap.sh"

start_dify() {
  echo "==> Starting Dify (port ${DIFY_HOST_PORT})…"
  (
    cd "$LAB_ROOT/vendor/dify/docker"
    docker compose up -d
  )
}

start_webui() {
  echo "==> Starting Open WebUI (port ${OPEN_WEBUI_HOST_PORT})…"
  ensure_lab_net
  docker compose -f "$LAB_ROOT/docker-compose.open-webui.yml" --env-file "$LAB_ROOT/.env" up -d
}

case "$LAB_MODE" in
  full)
    start_dify
    start_webui
    ;;
  dify)
    start_dify
    ;;
  webui)
    start_webui
    ;;
esac

echo
echo "==> Lab is coming up."
"$LAB_ROOT/scripts/status.sh" || true
echo
echo "URLs:"
[[ "$LAB_MODE" == "full" || "$LAB_MODE" == "dify" ]] && echo "  Dify install/admin:  http://localhost:${DIFY_HOST_PORT}/install"
[[ "$LAB_MODE" == "full" || "$LAB_MODE" == "webui" ]] && echo "  Open WebUI (optional): http://localhost:${OPEN_WEBUI_HOST_PORT}"
echo
echo "After Dify is healthy:"
echo "  1. Create admin at /install"
echo "  2. Install OpenRouter plugin (Marketplace) and paste OPENROUTER_API_KEY"
echo "  3. Publish an App; portal BFF calls Service API with user=student:<id>"
echo "  Optional demo chat: LAB_MODE=full and docs/HOW_TO_OPENROUTER_CANVAS.md"
