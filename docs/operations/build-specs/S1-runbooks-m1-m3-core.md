# Build spec S1 — Runbooks for M1–M3 core labs

**Checklist row:** S1  
**Catalog labs:**

| ID | Title |
|----|--------|
| m1-l01-member-benefits-faq | Member Benefits FAQ |
| m2-l01-plan-type-memory | Plan type memory |
| m3-l01-claims-status-read | Claims status read |

## Scope

Create instructor click-path runbooks under `docs/runbooks/`:

- `module-01-faq.md`
- `module-02-memory.md`
- `module-03-claims-tools.md`

Each runbook links to blueprint id, portal slug (from `./scripts/lab-view.sh --extract <id>`), and Studio node checklist.

## Out of scope

- Studio DSL export (S2)
- Portal BFF code (S3)
- Changing `lab-catalog.yaml` unless a typo blocks teaching

## Done when

1. Three runbook files exist with: **Objective**, **Prerequisites**, **Studio steps**, **Portal student path**, **Verify** (commands).
2. Each runbook references correct `portal_slug` and mock URL `http://127.0.0.1:3860` for M3.
3. `./scripts/lab-light-test.sh` passes.
4. `./scripts/programme-gate.sh` passes.
5. Extract sanity: `./scripts/lab-view.sh --extract m3-l01-claims-status-read` shows `claims-status` slug.

## Builder instructions

Implement only this spec. Do not write SHIP.

## Evaluator

Run programme-gate on tip SHA; confirm runbooks match catalog titles and blueprint node lists at high level.
