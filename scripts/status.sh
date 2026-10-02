#!/usr/bin/env bash
set -euo pipefail

# shellcheck source=lib.sh
source "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/lib.sh"
load_lab_env

echo "=== Docker ==="
docker info >/dev/null 2>&1 && echo "daemon: ok" || echo "daemon: NOT RUNNING"

echo
echo "=== Containers ==="
docker ps -a --format 'table {{.Names}}\t{{.Status}}\t{{.Ports}}' | head -40

if [[ -f "$LAB_ROOT/vendor/dify/docker/docker-compose.yaml" ]]; then
  echo
  echo "=== Dify compose ==="
  (cd "$LAB_ROOT/vendor/dify/docker" && docker compose ps) || true
fi

echo
echo "=== Lab network ==="
docker network inspect lab_net --format '{{.Name}} {{len .Containers}} containers' 2>/dev/null || echo "lab_net: missing"

echo
echo "=== HTTP probes ==="
for url in \
  "http://127.0.0.1:${DIFY_HOST_PORT}/" \
  "http://127.0.0.1:${DIFY_HOST_PORT}/install" \
  "http://127.0.0.1:${OPEN_WEBUI_HOST_PORT}/"; do
  code=$(curl -s -o /dev/null -w '%{http_code}' --max-time 3 "$url" || echo "down")
  echo "  ${url} -> ${code}"
done
