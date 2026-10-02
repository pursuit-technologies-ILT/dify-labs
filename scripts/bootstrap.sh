#!/usr/bin/env bash
# Bootstrap / refresh the Dify vendor tree and apply lab overlays.
set -euo pipefail

# shellcheck source=lib.sh
source "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/lib.sh"
load_lab_env

VENDOR="$LAB_ROOT/vendor/dify"
DOCKER_DIR="$VENDOR/docker"

mkdir -p "$LAB_ROOT/vendor"

if [[ ! -f "$DOCKER_DIR/docker-compose.yaml" ]]; then
  echo "==> Cloning Dify ${DIFY_VERSION} (docker/ only)…"
  rm -rf "$VENDOR"
  git clone --depth 1 --branch "$DIFY_VERSION" --filter=blob:none --sparse \
    https://github.com/langgenius/dify.git "$VENDOR"
  (
    cd "$VENDOR"
    git sparse-checkout set docker
  )
else
  echo "==> Dify vendor present at vendor/dify (tag ${DIFY_VERSION})"
fi

# nginx override attaches to external lab_net even when Open WebUI is off
ensure_lab_net

cp "$LAB_ROOT/lab/docker-compose.override.yml" "$DOCKER_DIR/docker-compose.override.yml"

cp "$DOCKER_DIR/.env.example" "$DOCKER_DIR/.env"
apply_env_overlay "$LAB_ROOT/lab/dify.env.overlay" "$DOCKER_DIR/.env"
apply_dify_host_port "$DOCKER_DIR/.env" "$DIFY_HOST_PORT"

if [[ -n "${DIFY_INIT_PASSWORD:-}" ]]; then
  set_env_kv "$DOCKER_DIR/.env" INIT_PASSWORD "$DIFY_INIT_PASSWORD"
fi

echo "==> Bootstrap complete."
echo "    Dify compose: $DOCKER_DIR"
echo "    Next: ./scripts/up.sh"
