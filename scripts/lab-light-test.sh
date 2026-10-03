#!/usr/bin/env bash
# Validate module blueprints, fixtures, and mock claims (optional single OpenRouter ping).
set -euo pipefail

# shellcheck source=lib.sh
source "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/lib.sh"

cd "$LAB_ROOT"

if ! docker network inspect lab_net >/dev/null 2>&1; then
  echo "==> Creating lab_net for mock-claims…"
  docker network create lab_net >/dev/null 2>&1 || true
fi

if ! curl -sf "http://127.0.0.1:${MOCK_CLAIMS_HOST_PORT:-3860}/health" >/dev/null 2>&1; then
  echo "==> Starting mock-claims on port ${MOCK_CLAIMS_HOST_PORT:-3860}…"
  docker compose -f "$LAB_ROOT/docker-compose.mock-claims.yml" --env-file "$LAB_ROOT/.env" up -d
  for _ in $(seq 1 20); do
    if curl -sf "http://127.0.0.1:${MOCK_CLAIMS_HOST_PORT:-3860}/health" >/dev/null 2>&1; then
      break
    fi
    sleep 0.5
  done
fi

export MOCK_CLAIMS_HOST_PORT="${MOCK_CLAIMS_HOST_PORT:-3860}"
node "$LAB_ROOT/lab/tests/run-light.mjs"
