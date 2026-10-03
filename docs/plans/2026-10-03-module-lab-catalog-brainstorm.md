---
artifact_contract: ce-unified-plan/v1
product_contract_source: ce-brainstorm
status: requirements-ready
created: 2026-10-03
---

# Goal capsule — module lab catalog & craft framework

**Goal:** Make the Dify training repo easy to extend with modular lab templates, automatic instance flows, and compound-engineering discipline so parallel agents can build without duplicating wiring or OpenRouter calls.

**Success looks like**

- ≥4 teachable labs per module (30 total) cataloged in `templates/lab-catalog.yaml`
- Single framework for registry, extract, wire, view, light tests
- Instance file drives auto-flow steps for a cohort
- Light tests pass without LLM; one integrator path for live ping

---

## Product contract

### Problem

Outline delivery needs many working template *types* (not only six capstone blueprints). Without a catalog and framework, each new lab re-invents mock URLs, portal slugs, and test scripts.

### Scope (in)

- Lab catalog (brainstorm → YAML)
- `lab/framework/*` modularity
- Instance + wire + auto-flow CLI
- Engineering craft doc + CONCEPTS + compound config
- Compound learning doc for framework pattern

### Scope (out)

- Portal BFF implementation (separate workstream)
- Full Dify DSL exports for all 30 labs (Studio iterations)
- Enterprise SSO

### Brainstorm — lab types per module (5 each)

See authoritative list in [templates/lab-catalog.yaml](../../templates/lab-catalog.yaml). Summary:

| Mod | Core labs | Stretch | Instructor |
|-----|-----------|---------|------------|
| 1 | FAQ, glossary | intake, after-hours | structured compare |
| 2 | plan memory | window reset, KB case, tier var | OODA worksheet |
| 3 | claims read, PA lookup | tool vs KB, 404 graceful | MCP vs HTTP |
| 4 | incomplete intake | classifier, NPI validate, fallback | sub-workflow |
| 5 | HITL appeal | monitor, sentiment, queue | pending copy |
| 6 | PHI logs, tool scope | red-team, retention | DSL secrets scan |

**Tier semantics**

- **core** — must run in default cohort instance
- **stretch** — second-day or advanced cohort
- **instructor** — train-the-trainer / demo only

### Non-functional

- DRY: one light-test registry, one parser, one catalog
- Modularity: framework must not import `web/` or vendor
- Agents: only integrator sets `OPENROUTER_LIVE=1`

### Compound loop (long iterations)

1. Add/adjust catalog row  
2. Extend blueprint or author worksheet  
3. `./scripts/lab-light-test.sh`  
4. Studio Preview + DSL export  
5. Runbook under `docs/runbooks/`  
6. `/ce-compound mode:non-interactive` when Dify/tenancy lesson is non-obvious  

### Next build waves (for ce-plan / ce-work)

| Wave | Deliverable |
|------|-------------|
| W1 | Runbooks for M1–M3 core labs |
| W2 | Studio builds for M2–M4 catalog core labs + DSL exports |
| W3 | Portal BFF slug map from `./scripts/lab-wire.sh` |
| W4 | Stretch labs + instructor tier toggled in instance YAML |

---

## Ready for planning check

- [x] Goal and success criteria stated  
- [x] Catalog ≥4 labs × 6 modules  
- [x] Framework boundaries documented  
- [x] Auto-flow + wire commands defined  
- [ ] Portal BFF (explicitly deferred)  
