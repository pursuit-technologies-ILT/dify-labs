#!/usr/bin/env bash
# Capture Dify / Open WebUI lab screenshots with Vibium + Chrome.
# See docs/SCREENSHOT_PROTOCOL.md
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
VIBIUM_DIR="$ROOT/tools/vibium"
OUT_DIR="${SCREENSHOT_OUT:-$ROOT/artifacts/screenshots}"

cd "$ROOT"

if [[ ! -d "$VIBIUM_DIR/node_modules/vibium" ]]; then
  echo "Installing Vibium into tools/vibium ..."
  (cd "$VIBIUM_DIR" && npm install --no-fund --no-audit)
fi

mkdir -p "$OUT_DIR"

# Prefer localhost hostnames for Dify cookie affinity.
export DIFY_BASE_URL="${DIFY_BASE_URL:-http://localhost:3847}"
export WEBUI_BASE_URL="${WEBUI_BASE_URL:-http://localhost:3848}"

# Headless by default; pass --headed through.
EXTRA_ARGS=("$@")
if [[ "${CAPTURE_HEADED:-0}" == "1" ]]; then
  EXTRA_ARGS+=(--headed)
fi

echo "=== Lab status (fail-soft) ==="
"$ROOT/scripts/status.sh" || true

echo "=== Capturing screenshots → $OUT_DIR ==="
node "$VIBIUM_DIR/capture-lab.js" --out "$OUT_DIR" "${EXTRA_ARGS[@]}"

echo "=== Generated PNGs ==="
find "$OUT_DIR" -type f -name '*.png' -printf '%s\t%p\n' | sort -k2
echo "Done."
