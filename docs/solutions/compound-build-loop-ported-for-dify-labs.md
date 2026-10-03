---
title: Compound build loop ported for Dify labs
tags: [operations, compound, multi-agent]
created: 2026-10-03
---

# Compound build loop ported for Dify labs

## Symptom

Long-horizon work (30-lab catalog, DSL exports, portal wiring) risks parallel agents self-approving, duplicating OpenRouter live tests, and opening PRs before programme gates pass.

## Decision

Port the **segregated compound build** pattern:

- SOP: `docs/operations/COMPOUND-BUILD-SOP.md`
- Skill: `skills/compound-build-loop/SKILL.md`
- Checklist + build-log + build-specs + independent evaluations
- Gate leaf commands: `./scripts/programme-gate.sh` (not `make pulse-loop`)

## Why not obvious from code

Light tests alone do not enforce **role firewall** or **PR hold**; those are process artifacts. The integrator rule for `OPENROUTER_LIVE=1` is policy, not enforced in CI yet.

## Verify

```bash
./scripts/programme-gate.sh
cat docs/operations/LAB-FACTORY-CHECKLIST.md
```

## Related

- [COMPOUND-BUILD-SOP.md](../operations/COMPOUND-BUILD-SOP.md)
- [lab-framework-registry-and-integrator.md](./lab-framework-registry-and-integrator.md)
