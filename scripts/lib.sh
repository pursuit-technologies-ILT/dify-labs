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

ensure_lab_net() {
  docker network inspect lab_net >/dev/null 2>&1 || docker network create lab_net
}

# Set KEY=VAL in a dotenv file (replace existing key or append).
set_env_kv() {
  local file="$1" key="$2" val="$3" esc_val
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
