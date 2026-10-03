---
name: compound-build-loop
description: Operate a segregated multi-agent compound build for the Dify training lab — builder slices on an integration branch, independent eval, monitoring build-log, programme-gate before a single integration PR. Use when shipping the lab-factory roadmap, portal wiring, DSL export waves, or any large change that must not self-SHIP; when the user asks for compound build, long horizon programme, or one PR at the end.
---

# Compound build loop (Dify labs)

**Purpose:** Run a **long programme** as **gated slices** on one **integration branch**, with **role-separated** agents and **one integration PR** only when the checklist is green and an independent evaluator **SHIP**s the bundle.

**Canonical SOP:** [docs/operations/COMPOUND-BUILD-SOP.md](../../docs/operations/COMPOUND-BUILD-SOP.md)

**Checklist:** [docs/operations/LAB-FACTORY-CHECKLIST.md](../../docs/operations/LAB-FACTORY-CHECKLIST.md)

**Gates:** `./scripts/programme-gate.sh` (= lab light tests + web lint + optional integrator OpenRouter)

---

## When to use

- Lab factory waves (runbooks → Studio DSL → portal wire map).
- Course outline delivery phases that touch framework, templates, mock API, and web together.
- Multi-subagent runs with builder / eval / adversarial / monitor lanes.
- User asks for **compound loop**, **long iterations**, or **large build then one PR**.

## When NOT to use

- Single-file fix → commit on `main`.
- Walkthrough-only UI tweak with no checklist row.
- Urgent hotfix without build-log exception note.

---

## Quick reference

```bash
./scripts/lab-light-test.sh
./scripts/programme-gate.sh
OPENROUTER_LIVE=1 OPENROUTER_API_KEY=sk-or-… ./scripts/programme-gate.sh   # integrator only, once
./scripts/lab-view.sh --json
./scripts/lab-auto-flow.sh cohort-default
```

**Builder reads:** one `docs/operations/build-specs/Sx-*.md` only.

**Eval writes:** `docs/operations/evaluations/*-independent.md` with **SHIP | NO-SHIP**.

**Monitor writes:** one row per slice in `docs/operations/build-log/*.md`.

**Rule:** Implementers do not mark checklist rows done; only **independent SHIP** + green `programme-gate`.

---

## Programme DAG

See mermaid diagrams in [COMPOUND-BUILD-SOP.md](../../docs/operations/COMPOUND-BUILD-SOP.md).

---

## Porting from another repo

Keep the **same role DAG**; replace leaf gates with this repo’s commands above. Copy this skill folder + `docs/operations/` layout.
