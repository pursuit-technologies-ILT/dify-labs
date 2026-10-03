# Adversarial review playbook (lab factory)

Independent of implementer chat. Output: `adversarial/YYYY-MM-DD-<slice>-independent.md`.

## Questions to stress

1. **Tenancy:** Could a student path accidentally mix API and Web App histories?
2. **Secrets:** Any DSL export or runbook paste real keys or `COLLAB_PASSWORD`?
3. **OpenRouter:** Could parallel agents double-bill live tests?
4. **Mock API:** Is claims mock reachable from SSRF-sensitive Dify nodes only on lab network?
5. **Catalog drift:** Do runbooks still match `templates/lab-catalog.yaml` ids?
6. **PHI:** Synthetic-only data in fixtures and prompts?

## Must not

- Mark checklist rows done.
- Implement fixes unless explicitly assigned after NO-SHIP.
