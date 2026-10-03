#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
FRAME="$ROOT/lab/framework/view.mjs"

if [[ "${1:-}" == "--extract" && -n "${2:-}" ]]; then
  node "$ROOT/lab/framework/cli-extract.mjs" "$2"
  exit 0
fi

if [[ "${1:-}" == "--json" ]]; then
  node "$FRAME" --json
  exit 0
fi

if [[ "${1:-}" == "--next" ]]; then
  node "$FRAME" --next --instance "${2:-cohort-default}"
  exit 0
fi

node "$FRAME"
