#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

if [[ -f "$ROOT/vendor/dify/docker/docker-compose.yaml" ]]; then
  (cd "$ROOT/vendor/dify/docker" && docker compose down) || true
fi
docker compose -f "$ROOT/docker-compose.open-webui.yml" --env-file "$ROOT/.env" down 2>/dev/null || true
echo "Lab stack stopped."
