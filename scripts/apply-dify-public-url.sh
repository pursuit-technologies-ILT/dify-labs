#!/usr/bin/env bash
# Rewrite Dify public URL env vars and recreate API/web/nginx so cookies match a tunnel host.
# Usage: ./scripts/apply-dify-public-url.sh https://example.trycloudflare.com
# Restore local: ./scripts/apply-dify-public-url.sh --localhost
set -euo pipefail

source "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/lib.sh"
load_lab_env

DOCKER_ENV="$LAB_ROOT/vendor/dify/docker/.env"
if [[ ! -f "$DOCKER_ENV" ]]; then
  echo "error: missing $DOCKER_ENV — run ./scripts/up.sh first." >&2
  exit 1
fi

TARGET="${1:-}"
if [[ -z "$TARGET" ]]; then
  echo "usage: $0 https://<tunnel-host> | --localhost" >&2
  exit 1
fi

if [[ "$TARGET" == "--localhost" ]]; then
  echo "==> Restoring Dify URLs to http://localhost:${DIFY_HOST_PORT}"
  apply_dify_host_port "$DOCKER_ENV" "$DIFY_HOST_PORT"
else
  echo "==> Pointing Dify public URLs at ${TARGET}"
  apply_dify_public_base_url "$DOCKER_ENV" "$TARGET"
fi

echo "==> Recreating api/worker/web/nginx to pick up URLs…"
(
  cd "$LAB_ROOT/vendor/dify/docker"
  docker compose up -d --force-recreate --no-deps api worker worker_beat web nginx
)

echo "done."
