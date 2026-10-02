# Docs index

Read in this order when onboarding or publishing the repo.

## Hierarchy

| Layer | Doc | Purpose |
|-------|-----|---------|
| 1. Memory | [../AGENTS.md](../AGENTS.md) | Non-negotiables, stack roles, ops commands |
| 2. Architecture | [ARCHITECTURE.md](ARCHITECTURE.md) | Topology, compose footprint, scale, secrets |
| 3. Spec | [SPEC_CAPABILITIES.md](SPEC_CAPABILITIES.md) | What Dify CE delivers for this course |
| 4. Plan | [ACTION_PLAN_COURSE_DELIVERY.md](ACTION_PLAN_COURSE_DELIVERY.md) | Phased delivery checklist |
| 5. Tenancy | [DEPLOY_AND_STUDENT_TENANCY.md](DEPLOY_AND_STUDENT_TENANCY.md) | Custom domain + portal BFF `user=` |
| 6. Decisions | [memory/DECISIONS.md](memory/DECISIONS.md) | Append-only decision log |
| 7. Links | [REFERENCE_LINKS.md](REFERENCE_LINKS.md) | Canonical Dify / OpenRouter / lab URLs |

## Supporting

| Doc | Purpose |
|-----|---------|
| [CURRICULUM_REFACTOR_N8N_TO_DIFY.md](CURRICULUM_REFACTOR_N8N_TO_DIFY.md) | Module/lab mapping from the n8n outline |
| [COURSE_DESCRIPTION_DIFY.md](COURSE_DESCRIPTION_DIFY.md) | LMS blurb (Dify edition) |
| [HOW_TO_OPENROUTER_CANVAS.md](HOW_TO_OPENROUTER_CANVAS.md) | Builder click path for OpenRouter |

## Ops scripts (repo root)

| Script | Role |
|--------|------|
| `scripts/ensure-docker.sh` | Start Docker in no-systemd sandboxes |
| `scripts/bootstrap.sh` | Vendor Dify + apply `lab/` overlays |
| `scripts/up.sh` / `down.sh` / `status.sh` | Start / stop / probe |
| `scripts/lib.sh` | Shared env / overlay helpers |

Default `LAB_MODE=dify`. Ports **3847** (Dify) and **3848** (Open WebUI).
