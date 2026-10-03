# Docs index

Read in this order when onboarding or publishing the repo.

## Hierarchy

| Layer | Doc | Purpose |
|-------|-----|---------|
| 0. Handoff | [HANDOFF.md](HANDOFF.md) | Shareable continuity: run, architecture, tenancy, screenshots, next steps |
| 0c. Website BFF | [WEBSITE_INTEGRATION.md](WEBSITE_INTEGRATION.md) | How developers wire Dify into the shared portal |
| 1. Memory | [../AGENTS.md](../AGENTS.md) | Non-negotiables, stack roles, ops commands |
| 2. Architecture | [ARCHITECTURE.md](ARCHITECTURE.md) | Topology, compose footprint, scale, secrets |
| 3. Spec | [SPEC_CAPABILITIES.md](SPEC_CAPABILITIES.md) | What Dify CE delivers for this course |
| 4. Plan | [ACTION_PLAN_COURSE_DELIVERY.md](ACTION_PLAN_COURSE_DELIVERY.md) | Phased delivery checklist |
| 5. Tenancy | [DEPLOY_AND_STUDENT_TENANCY.md](DEPLOY_AND_STUDENT_TENANCY.md) | Custom domain + portal BFF `user=` |
| 6. Decisions | [memory/DECISIONS.md](memory/DECISIONS.md) | Append-only decision log |
| 7. Links | [REFERENCE_LINKS.md](REFERENCE_LINKS.md) | Canonical Dify / OpenRouter / lab URLs |
| 8. Screenshots | [SCREENSHOT_PROTOCOL.md](SCREENSHOT_PROTOCOL.md) | Vibium + Chrome capture for lab materials |

## Supporting

| Doc | Purpose |
|-----|---------|
| [CURRICULUM_REFACTOR_N8N_TO_DIFY.md](CURRICULUM_REFACTOR_N8N_TO_DIFY.md) | Module/lab mapping from the n8n outline |
| [COURSE_DESCRIPTION_DIFY.md](COURSE_DESCRIPTION_DIFY.md) | LMS blurb (Dify edition) |
| [HOW_TO_OPENROUTER_CANVAS.md](HOW_TO_OPENROUTER_CANVAS.md) | Builder click path for OpenRouter |
| [lab-materials/SHOT_LIST.md](lab-materials/SHOT_LIST.md) | Module shot list + caption style |

## Ops scripts (repo root)

| Script | Role |
|--------|------|
| `scripts/ensure-docker.sh` | Start Docker in no-systemd sandboxes |
| `scripts/bootstrap.sh` | Vendor Dify + apply `lab/` overlays |
| `scripts/up.sh` / `down.sh` / `status.sh` | Start / stop / probe |
| `scripts/lib.sh` | Shared env / overlay helpers |
| `scripts/set-dify-admin-password.sh` | Align Studio admin hash with `COLLAB_PASSWORD` |
| `scripts/apply-dify-public-url.sh` | Point Dify URL env at a tunnel (or `--localhost`) |
| `scripts/tunnel-dify.sh` | Cloudflare quick tunnel to :3847 |
| `scripts/screenshots/capture-lab.sh` | Vibium + Chrome lab screenshots |
| `scripts/collab-sso.sh` | Studio SSO helper on :3850 (`/collab-sso`) |

Default `LAB_MODE=dify`. Ports **3847** (Dify) and **3848** (Open WebUI).
