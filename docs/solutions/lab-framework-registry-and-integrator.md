---
title: Lab framework — registry, wiring, single integrator
tags: [lab, compound, openrouter, modularity]
created: 2026-10-03
---

# Lab framework — registry, wiring, single integrator

## Symptom

Parallel agents building module labs duplicated mock URL checks, blueprint parsing, and OpenRouter smoke tests. Catalog labs had no machine-readable inventory beyond six capstone blueprints.

## Decision

1. **`templates/lab-catalog.yaml`** is the only lab inventory (30 labs, tiers core/stretch/instructor).
2. **`lab/framework/`** owns parse, registry, extract, wire, view, auto-flow, and **`light-tests/index.mjs`** handlers.
3. **Scripts stay thin** — `lab-light-test.sh`, `lab-wire.sh`, `lab-view.sh`, `lab-auto-flow.sh`.
4. **Only the integrator** runs `OPENROUTER_LIVE=1` once per pipeline; all other validation is mock/fixture/schema.

## Why not obvious from code

The walkthrough uses BYO keys in the browser; the class path uses portal BFF + App keys. Without this doc, agents assume every test file should call OpenRouter or that blueprints alone enumerate all teachable labs.

## Verify

```bash
./scripts/lab-light-test.sh
./scripts/lab-view.sh --json
./scripts/lab-wire.sh cohort-default
./scripts/lab-auto-flow.sh cohort-default
```

## Related

- [ENGINEERING_CRAFT.md](../ENGINEERING_CRAFT.md)
- [CONCEPTS.md](../CONCEPTS.md)
- [plans/NODE_BUILDER_LABS.md](../plans/NODE_BUILDER_LABS.md)
