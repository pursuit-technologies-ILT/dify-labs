#!/usr/bin/env bash
set -euo pipefail
INSTANCE="${1:-cohort-default}"
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
node "$ROOT/lab/framework/auto-flow.mjs" --instance "$INSTANCE" "$@"
