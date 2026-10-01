#!/usr/bin/env bash
# Bring up the lab stack. Requires Docker. You only need keys in /.env.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

if [[ ! -f "$ROOT/.env" ]]; then
  echo "No .env found. Creating from .env.example — add OPENROUTER_API_KEY when ready."
  cp "$ROOT/.env.example" "$ROOT/.env"
fi

# shellcheck disable=SC1091
set -a
# shellcheck source=/dev/null
source "$ROOT/.env"
set +a

LAB_MODE="${LAB_MODE:-full}"
DIFY_HOST_PORT="${DIFY_HOST_PORT:-3847}"
OPEN_WEBUI_HOST_PORT="${OPEN_WEBUI_HOST_PORT:-3848}"

# Ensure dockerd is reachable
if ! docker info >/dev/null 2>&1; then
  echo "Docker daemon not reachable. On this sandbox try:"
  echo "  sudo dockerd --host=unix:///var/run/docker.sock --iptables=false &>/tmp/dockerd.log &"
  exit 1
fi

"$ROOT/scripts/bootstrap.sh"

start_dify() {
  echo "==> Starting Dify (port ${DIFY_HOST_PORT})…"
  (
    cd "$ROOT/vendor/dify/docker"
    docker compose up -d
  )
}

start_webui() {
  echo "==> Starting Open WebUI (port ${OPEN_WEBUI_HOST_PORT})…"
  docker network inspect lab_net >/dev/null 2>&1 || docker network create lab_net
  docker compose -f "$ROOT/docker-compose.open-webui.yml" --env-file "$ROOT/.env" up -d
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
  *)
    echo "Unknown LAB_MODE=$LAB_MODE (use full|dify|webui)"
    exit 1
    ;;
esac

echo
echo "==> Lab is coming up."
"$ROOT/scripts/status.sh" || true
echo
echo "URLs:"
[[ "$LAB_MODE" == "full" || "$LAB_MODE" == "dify" ]] && echo "  Dify install/admin:  http://localhost:${DIFY_HOST_PORT}/install"
[[ "$LAB_MODE" == "full" || "$LAB_MODE" == "webui" ]] && echo "  Open WebUI (trainees): http://localhost:${OPEN_WEBUI_HOST_PORT}"
echo
echo "After Dify is healthy:"
echo "  1. Create admin at /install"
echo "  2. Install OpenRouter plugin (Marketplace) and paste OPENROUTER_API_KEY"
echo "  3. Build an App, publish API, point Open WebUI at Dify's OpenAI-compatible endpoint"
echo "  See docs/OPENROUTER_AND_PORTAL.md"
