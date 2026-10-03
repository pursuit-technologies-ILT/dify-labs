#!/usr/bin/env bash
set -euo pipefail
INSTANCE="${1:-cohort-default}"
node "$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)/lab/framework/wire.mjs" --instance "$INSTANCE"
