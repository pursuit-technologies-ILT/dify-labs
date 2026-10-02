#!/usr/bin/env bash
# Report Docker / compose / HTTP health. Fail-soft when Docker or services are down.
set -euo pipefail

# shellcheck source=lib.sh
source "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/lib.sh"
load_lab_env

echo "=== Docker ==="
if docker_daemon_ok; then
  echo "daemon: ok ($(docker info -f '{{.Driver}}' 2>/dev/null || echo unknown))"
else
  echo "daemon: NOT RUNNING"
  echo "hint: ./scripts/ensure-docker.sh   then   ./scripts/up.sh"
fi

echo
echo "=== Containers ==="
if docker_daemon_ok; then
  docker ps -a --format 'table {{.Names}}\t{{.Status}}\t{{.Ports}}' 2>/dev/null | head -40 || echo "(unable to list containers)"
else
  echo "(skipped — Docker daemon unavailable)"
fi

if docker_daemon_ok && [[ -f "$LAB_ROOT/vendor/dify/docker/docker-compose.yaml" ]]; then
  echo
  echo "=== Dify compose ==="
  (cd "$LAB_ROOT/vendor/dify/docker" && docker compose ps) 2>/dev/null || echo "(compose ps unavailable)"
fi

echo
echo "=== Lab network ==="
if docker_daemon_ok; then
  docker network inspect lab_net --format '{{.Name}} {{len .Containers}} containers' 2>/dev/null || echo "lab_net: missing"
else
  echo "lab_net: (skipped)"
fi

echo
echo "=== HTTP probes ==="
probe_http "http://127.0.0.1:${DIFY_HOST_PORT}/"
probe_http "http://127.0.0.1:${DIFY_HOST_PORT}/install"
probe_http "http://127.0.0.1:${OPEN_WEBUI_HOST_PORT}/"

if ! docker_daemon_ok; then
  exit 1
fi
