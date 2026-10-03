#!/usr/bin/env bash
# Programme gate stack — run on integration branch tip before slice eval or bundle PR.
# Ordering: lab light tests → walkthrough lint → optional live OpenRouter (integrator only).
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

echo "==> programme-gate: lab-light-test"
"$ROOT/scripts/lab-light-test.sh"

echo "==> programme-gate: web lint"
(cd "$ROOT/web" && npm run lint)

if [[ "${OPENROUTER_LIVE:-}" == "1" ]]; then
  echo "==> programme-gate: integrator live ping (OPENROUTER_LIVE=1)"
  OPENROUTER_LIVE=1 node "$ROOT/lab/tests/run-light.mjs"
else
  echo "==> programme-gate: skip live OpenRouter (integrator sets OPENROUTER_LIVE=1 when needed)"
fi

echo "==> programme-gate: OK"
