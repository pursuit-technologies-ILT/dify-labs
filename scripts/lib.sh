#!/usr/bin/env bash
# Shared helpers for lab ops scripts. Source from sibling scripts only.
# shellcheck shell=bash

LAB_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

load_lab_env() {
  if [[ -f "$LAB_ROOT/.env" ]]; then
    # shellcheck disable=SC1091
    set -a
    # shellcheck source=/dev/null
    source "$LAB_ROOT/.env"
    set +a
  fi
  DIFY_HOST_PORT="${DIFY_HOST_PORT:-3847}"
  OPEN_WEBUI_HOST_PORT="${OPEN_WEBUI_HOST_PORT:-3848}"
  LAB_MODE="${LAB_MODE:-dify}"
  DIFY_VERSION="${DIFY_VERSION:-1.17.1}"
}

docker_daemon_ok() {
  docker info >/dev/null 2>&1
}

ensure_lab_net() {
  if ! docker_daemon_ok; then
    echo "error: Docker daemon is not running. Try: ./scripts/ensure-docker.sh" >&2
    return 1
  fi
  docker network inspect lab_net >/dev/null 2>&1 || docker network create lab_net
}

# Set KEY=VAL in a dotenv file (replace existing key or append).
set_env_kv() {
  local file="$1" key="$2" val="$3" esc_val
  if [[ ! -f "$file" ]]; then
    echo "error: dotenv file not found: $file" >&2
    return 1
  fi
  esc_val=$(printf '%s\n' "$val" | sed -e 's/[\/&]/\\&/g')
  if grep -qE "^${key}=" "$file"; then
    sed -i -E "s|^${key}=.*|${key}=${esc_val}|" "$file"
  else
    echo "${key}=${val}" >>"$file"
  fi
}

# Apply non-comment KEY=VAL lines from an overlay file onto a target dotenv.
apply_env_overlay() {
  local overlay="$1" target="$2" line key val
  if [[ ! -f "$overlay" ]]; then
    echo "error: overlay not found: $overlay" >&2
    return 1
  fi
  if [[ ! -f "$target" ]]; then
    echo "error: target dotenv not found: $target" >&2
    return 1
  fi
  while IFS= read -r line || [[ -n "$line" ]]; do
    [[ -z "$line" || "$line" =~ ^# ]] && continue
    key="${line%%=*}"
    val="${line#*=}"
    set_env_kv "$target" "$key" "$val"
  done <"$overlay"
}

# Single source of truth for host-facing Dify URLs / publish port.
apply_dify_host_port() {
  local docker_env="$1" port="${2:-3847}"
  set_env_kv "$docker_env" EXPOSE_NGINX_PORT "$port"
  local k
  for k in CONSOLE_API_URL CONSOLE_WEB_URL SERVICE_API_URL APP_API_URL APP_WEB_URL FILES_URL TRIGGER_URL; do
    set_env_kv "$docker_env" "$k" "http://localhost:${port}"
  done
  set_env_kv "$docker_env" ENDPOINT_URL_TEMPLATE "http://localhost:${port}/e/{hook_id}"
  set_env_kv "$docker_env" NEXT_PUBLIC_SOCKET_URL "ws://localhost:${port}"
}

# Point Dify console/app/file URLs at a public HTTPS (or HTTP) origin.
# Required when exposing nginx :3847 via a tunnel so Studio cookies/CSRF match.
apply_dify_public_base_url() {
  local docker_env="$1" base="${2%/}" host ws
  if [[ -z "$base" ]]; then
    echo "error: public base URL is empty" >&2
    return 1
  fi
  host="${base#https://}"
  host="${host#http://}"
  if [[ "$base" == https://* ]]; then
    ws="wss://${host}"
  else
    ws="ws://${host}"
  fi
  local k
  for k in CONSOLE_API_URL CONSOLE_WEB_URL SERVICE_API_URL APP_API_URL APP_WEB_URL FILES_URL TRIGGER_URL; do
    set_env_kv "$docker_env" "$k" "$base"
  done
  set_env_kv "$docker_env" ENDPOINT_URL_TEMPLATE "${base}/e/{hook_id}"
  set_env_kv "$docker_env" NEXT_PUBLIC_SOCKET_URL "$ws"
}

# Probe one URL; prints "<url> -> <code|down>" and never fails the caller.
probe_http() {
  local url="$1" code
  code=$(curl -s -o /dev/null -w '%{http_code}' --max-time 3 "$url" 2>/dev/null || true)
  [[ -z "$code" || "$code" == "000" ]] && code="down"
  echo "  ${url} -> ${code}"
}
