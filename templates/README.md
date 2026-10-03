# Module lab blueprints (node-builder track)

Version-controlled **builder specs** for the 2-day course (*No-Code Agentic AI* — health-plan scenarios). Each file is a blueprint instructors follow in Dify Studio; full DSL YAML exports land here after canvas work is signed off.

**Full lab inventory (30 labs, 5 per module):** [lab-catalog.yaml](./lab-catalog.yaml) — core / stretch / instructor tiers.

**Framework:** [lab/framework/](../lab/framework/) — registry, wiring, extraction, light tests. See [docs/ENGINEERING_CRAFT.md](../docs/ENGINEERING_CRAFT.md).

| File | Module | Studio app | Student portal slug (planned) |
|------|--------|------------|-------------------------------|
| [module-01-member-benefits-faq.lab.yaml](./module-01-member-benefits-faq.lab.yaml) | 1 | Chatflow FAQ | `member-benefits-faq` |
| [module-02-plan-memory.lab.yaml](./module-02-plan-memory.lab.yaml) | 2 | Chatflow + conversation vars | `member-service-memory` |
| [module-03-claims-status.lab.yaml](./module-03-claims-status.lab.yaml) | 3 | Chatflow + HTTP tool | `claims-status` |
| [module-04-prior-auth-intake.lab.yaml](./module-04-prior-auth-intake.lab.yaml) | 4 | Workflow / Chatflow intake | `prior-auth-intake` |
| [module-05-denial-appeal-hitl.lab.yaml](./module-05-denial-appeal-hitl.lab.yaml) | 5 | Workflow + Human Input | `denial-appeal` |
| [module-06-ethics-audit.lab.yaml](./module-06-ethics-audit.lab.yaml) | 6 | Worksheet + log review | *(worksheet)* |

**Outline source:** [docs/CURRICULUM_REFACTOR_N8N_TO_DIFY.md](../docs/CURRICULUM_REFACTOR_N8N_TO_DIFY.md) and [docs/ACTION_PLAN_COURSE_DELIVERY.md](../docs/ACTION_PLAN_COURSE_DELIVERY.md).

## Light tests (no OpenRouter)

```bash
./scripts/lab-light-test.sh
```

Validates every blueprint, runs mock HTTP fixtures, and checks walkthrough prompt fixtures. **One** optional live OpenRouter ping runs only when `OPENROUTER_API_KEY` is set (single call — do not run in parallel agents).

## Export workflow (compound loop)

1. Build nodes on canvas per blueprint `nodes` + `acceptance`.
2. Preview in Studio; run `./scripts/lab-light-test.sh`.
3. Export DSL from Studio → `templates/exports/module-0N-<slug>.yml` (gitignored until reviewed).
4. Promote export to tracked `templates/module-0N-*.yml` when instructor checklist passes.
