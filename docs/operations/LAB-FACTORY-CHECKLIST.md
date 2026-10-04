# Lab factory programme checklist

Deliver **30 catalog labs** + **6 capstone blueprints** + instructor runbooks without drift. Independent eval required before each row is **done**.

**Build log:** [build-log/2026-10-03-lab-factory.md](./build-log/2026-10-03-lab-factory.md)

**PR:** **hold** until all rows below are **done (eval SHIP)** and bundle eval SHIP + `./scripts/programme-gate.sh` green.

| ID | Item | Gate | Status |
|----|------|------|--------|
| S0 | Lab framework + 30-lab catalog + mock claims + craft docs | `./scripts/programme-gate.sh` | **done (eval SHIP)** — [eval](../operations/evaluations/2026-10-03-S0-framework-independent.md) |
| S1 | Runbooks for M1–M3 **core** catalog labs | Spec gates in [S1 build spec](./build-specs/S1-runbooks-m1-m3-core.md) | **builder complete; pending eval SHIP** |
| S2 | Studio DSL exports for M2–M4 **core** (promote from `templates/exports/`) | Light tests + export files present | pending |
| S3 | Portal wire contract doc from `./scripts/lab-wire.sh` | BFF contract markdown + slug map | pending |
| S4 | Stretch tier enabled in `cohort-advanced.instance.yaml` | Instance + auto-flow steps | pending |
| S5 | Bundle documentation sync (HANDOFF, SPEC §7, ACTION_PLAN) | Review diff | pending |
| **PR** | Single integration PR | S0–S5 + bundle eval SHIP | **hold** |

---

## Slice gate defaults

Every slice must keep these green unless the build spec says docs-only:

```bash
./scripts/lab-light-test.sh
cd web && npm run lint
```

Programme gate before eval SHIP:

```bash
./scripts/programme-gate.sh
```

Live OpenRouter (integrator, once per slice that requires LLM proof):

```bash
OPENROUTER_LIVE=1 OPENROUTER_API_KEY=sk-or-… ./scripts/programme-gate.sh
```
