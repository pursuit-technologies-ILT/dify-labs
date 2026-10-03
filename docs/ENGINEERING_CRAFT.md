# Engineering craft (modularity, DRY, compound loop)

Senior-engineer defaults for this repo. Complements [AGENTS.md](../AGENTS.md) non-negotiables.

## Layer boundaries

| Layer | Owns | Must not |
|-------|------|----------|
| `lab/framework/` | Parsing, registry, wiring, light tests, views | Import from `web/` or Dify vendor |
| `templates/` | Blueprints, catalog, fixtures, DSL exports | Runtime secrets |
| `services/` | Mock HTTP APIs for tool labs | Call OpenRouter |
| `scripts/` | Thin CLI wrappers | Duplicate framework logic |
| `web/` | Collaborator walkthrough UI | Portal BFF (future separate service) |
| `vendor/dify/` | Pinned CE compose | Course content |

## DRY rules

1. **One light-test registry** — add handlers under `lab/framework/light-tests/`; register in `lab/framework/light-tests/index.mjs`. Do not embed HTTP checks in random scripts.
2. **One blueprint parser** — `lab/framework/parse-blueprint.mjs` used by registry, extract, and tests.
3. **One catalog source** — `templates/lab-catalog.yaml` drives module lab inventory; blueprints link via `blueprint_id` when applicable.
4. **One wiring emitter** — `node lab/framework/wire.mjs --instance <id>` for portal/mock/Dify URLs.
5. **Scripts call framework** — `scripts/lab-light-test.sh`, `scripts/lab-wire.sh`, `scripts/lab-view.sh` stay thin.

## Modularity checklist (new lab)

- [ ] Add catalog entry in `templates/lab-catalog.yaml`
- [ ] Add or extend blueprint if Studio graph is new
- [ ] Add fixtures under `templates/fixtures/` if needed
- [ ] Register light tests (or reuse ids)
- [ ] Extend mock service OpenAPI if new tool surface
- [ ] Run `./scripts/lab-light-test.sh`
- [ ] Export DSL to `templates/exports/` when Studio sign-off
- [ ] `/ce-compound` if non-obvious reasoning (Dify quirk, tenancy, SSO)

## Compound loop (long iterations)

```text
catalog entry → blueprint (optional) → Studio build → light tests → live ping (integrator only)
→ DSL export → runbook → compound doc in docs/solutions/
```

Parallel agents: framework + catalog + mock API + runbooks. **One** integrator for `OPENROUTER_LIVE=1`.

Long-horizon programmes use [operations/COMPOUND-BUILD-SOP.md](./operations/COMPOUND-BUILD-SOP.md) (role firewall, build-log, independent eval before checklist **done**).

## Automatic flows (instances)

`lab/instances/*.instance.yaml` select which catalog labs are enabled and map:

- `portal_base`, `dify_public_url`, `mock_claims_base`
- per-lab `portal_slug` and `enabled: true|false`

Run:

```bash
node lab/framework/auto-flow.mjs --instance cohort-default --format steps
```

Agents consume the step list without re-deriving wiring from scattered docs.
