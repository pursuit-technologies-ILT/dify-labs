# Build spec Sx — <title>

**Programme:** Lab factory  
**Checklist row:** Sx  
**Branch:** `main` or `cursor/lab-factory-dbd6`

## Scope

One paragraph — what files/subsystems may change.

## Out of scope

Bullets — what this slice must not touch.

## Done when

1. Testable outcome (file path, command output, or user-visible behavior).
2. …
3. Gate: `./scripts/lab-light-test.sh` (always).
4. Gate: `./scripts/programme-gate.sh` before eval request.
5. Optional: `OPENROUTER_LIVE=1` — **integrator only** if slice requires live LLM.

## Builder instructions

- Read **only** this spec.
- Do not mark checklist row done.
- Commit + push each logical chunk.

## Evaluator inputs

- SHA reviewed:
- Commands run:
- Done-when table:
