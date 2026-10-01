#!/usr/bin/env bash
# Bootstrap / refresh the Dify vendor tree and apply lab overlays.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DIFY_VERSION="${DIFY_VERSION:-1.17.1}"
VENDOR="$ROOT/vendor/dify"
DOCKER_DIR="$VENDOR/docker"

mkdir -p "$ROOT/vendor"

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

# Ensure lab network exists for cross-compose linking
docker network inspect lab_net >/dev/null 2>&1 || docker network create lab_net

# Copy override into Dify docker dir (Compose auto-loads it)
cp "$ROOT/lab/docker-compose.override.yml" "$DOCKER_DIR/docker-compose.override.yml"

# Build .env from upstream example + lab overlay + optional root .env keys
cp "$DOCKER_DIR/.env.example" "$DOCKER_DIR/.env"
# Apply overlay key=value pairs
while IFS= read -r line || [[ -n "$line" ]]; do
  [[ -z "$line" || "$line" =~ ^# ]] && continue
  key="${line%%=*}"
  val="${line#*=}"
  if grep -qE "^${key}=" "$DOCKER_DIR/.env"; then
    # Escape for sed
    esc_val=$(printf '%s\n' "$val" | sed -e 's/[\/&]/\\&/g')
    sed -i -E "s|^${key}=.*|${key}=${esc_val}|" "$DOCKER_DIR/.env"
  else
    echo "${key}=${val}" >>"$DOCKER_DIR/.env"
  fi
done <"$ROOT/lab/dify.env.overlay"

# Merge host port / init password from repo .env if present
if [[ -f "$ROOT/.env" ]]; then
  # shellcheck disable=SC1091
  set -a
  # shellcheck source=/dev/null
  source "$ROOT/.env"
  set +a
  if [[ -n "${DIFY_HOST_PORT:-}" ]]; then
    sed -i -E "s|^EXPOSE_NGINX_PORT=.*|EXPOSE_NGINX_PORT=${DIFY_HOST_PORT}|" "$DOCKER_DIR/.env"
    for k in CONSOLE_API_URL CONSOLE_WEB_URL SERVICE_API_URL APP_API_URL APP_WEB_URL FILES_URL TRIGGER_URL; do
      sed -i -E "s|^${k}=.*|${k}=http://localhost:${DIFY_HOST_PORT}|" "$DOCKER_DIR/.env"
    done
    sed -i -E "s|^ENDPOINT_URL_TEMPLATE=.*|ENDPOINT_URL_TEMPLATE=http://localhost:${DIFY_HOST_PORT}/e/{hook_id}|" "$DOCKER_DIR/.env"
    sed -i -E "s|^NEXT_PUBLIC_SOCKET_URL=.*|NEXT_PUBLIC_SOCKET_URL=ws://localhost:${DIFY_HOST_PORT}|" "$DOCKER_DIR/.env"
  fi
  if [[ -n "${DIFY_INIT_PASSWORD:-}" ]]; then
    if grep -qE '^INIT_PASSWORD=' "$DOCKER_DIR/.env"; then
      sed -i -E "s|^INIT_PASSWORD=.*|INIT_PASSWORD=${DIFY_INIT_PASSWORD}|" "$DOCKER_DIR/.env"
    else
      echo "INIT_PASSWORD=${DIFY_INIT_PASSWORD}" >>"$DOCKER_DIR/.env"
    fi
  fi
fi

echo "==> Bootstrap complete."
echo "    Dify compose: $DOCKER_DIR"
echo "    Next: ./scripts/up.sh"
