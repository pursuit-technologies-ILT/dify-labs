#!/usr/bin/env bash
# Stop lab containers (Dify + Open WebUI if present). Safe if either is absent.
set -euo pipefail

# shellcheck source=lib.sh
source "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/lib.sh"

if ! docker_daemon_ok; then
  echo "Docker daemon is not running — nothing to stop."
  echo "hint: ./scripts/ensure-docker.sh"
  exit 0
fi

if [[ -f "$LAB_ROOT/vendor/dify/docker/docker-compose.yaml" ]]; then
  (cd "$LAB_ROOT/vendor/dify/docker" && docker compose down) || true
fi
if [[ -f "$LAB_ROOT/.env" ]]; then
  docker compose -f "$LAB_ROOT/docker-compose.open-webui.yml" --env-file "$LAB_ROOT/.env" down 2>/dev/null || true
else
  docker compose -f "$LAB_ROOT/docker-compose.open-webui.yml" down 2>/dev/null || true
fi
echo "Lab stack stopped."
