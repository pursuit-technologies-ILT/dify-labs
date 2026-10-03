#!/usr/bin/env bash
# Run the Studio SSO helper on :3850 (used by nginx /collab-sso).
set -euo pipefail

source "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/lib.sh"
load_lab_env

export DIFY_INTERNAL_URL="${DIFY_INTERNAL_URL:-http://127.0.0.1:3847}"
echo "==> Studio SSO helper on :3850 (reads web/.env.local; teardown ~2026-10-06)"
exec python3 "$LAB_ROOT/scripts/collab-sso-helper.py"
