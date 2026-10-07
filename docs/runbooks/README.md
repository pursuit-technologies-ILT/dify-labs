# Instructor runbooks — lab factory

Click-path guides for cohort delivery. Blueprints live in `templates/*.lab.yaml`; catalog ids in [templates/lab-catalog.yaml](../../templates/lab-catalog.yaml).

## Core labs (S1 — Modules 1–3)

| Module | Runbook | Catalog lab id | Portal slug |
|--------|---------|----------------|-------------|
| 1 | [module-01-faq.md](./module-01-faq.md) | `m1-l01-member-benefits-faq` | `member-benefits-faq` |
| 2 | [module-02-memory.md](./module-02-memory.md) | `m2-l01-plan-type-memory` | `member-service-memory` |
| 3 | [module-03-claims-tools.md](./module-03-claims-tools.md) | `m3-l01-claims-status-read` | `claims-status` |

## Commands (all runbooks)

```bash
./scripts/lab-view.sh --extract <catalog-lab-id>
./scripts/lab-light-test.sh
./scripts/programme-gate.sh
```

Module 3 also documents mock claims at **`http://127.0.0.1:3860`**.

## Related docs

- [VERIFY-REPO-AND-GITHUB.md](./VERIFY-REPO-AND-GITHUB.md) — confirm correct clone, org publish, no symlink myths
- [TROUBLESHOOTING-MACOS.md](./TROUBLESHOOTING-MACOS.md) — Docker Desktop, sudo vs `COLLAB_PASSWORD`
- [HOW_TO_OPENROUTER_CANVAS.md](../HOW_TO_OPENROUTER_CANVAS.md) — Studio + OpenRouter
- [DEPLOY_AND_STUDENT_TENANCY.md](../DEPLOY_AND_STUDENT_TENANCY.md) — `user=student:<id>` BFF path
- [S1 build spec](../operations/build-specs/S1-runbooks-m1-m3-core.md)
- Programme checklist: [LAB-FACTORY-CHECKLIST.md](../operations/LAB-FACTORY-CHECKLIST.md)
