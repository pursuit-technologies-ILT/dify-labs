# AGENTS.md — long-term project memory

This repo is an **enterprise training lab** that replaces **n8n** with **self-hosted Dify** (+ optional Open WebUI) for the 2-day course *No-Code Agentic AI: Building Business Automation* (health-insurance scenarios).

## Non-negotiables

1. **n8n is out** — unapproved; do not reintroduce it.
2. **Builders** use Dify Studio (Chatflow / Workflow canvas). **Students** never need Studio login.
3. **Minimize student logins** — portal is the only student IdP. Prefer **portal BFF → Dify Service API** with `user=<portal_student_id>`.
4. **Keys only from operator** — OpenRouter (lab) or enterprise LLM gateway (prod) via `.env` / portal secrets. Never commit secrets.
5. **Pinned Dify** — Community Edition **1.17.1** under `vendor/dify/docker` (see `vendor/DIFY_VERSION`).
6. **Lab ports** — Dify `3847`, Open WebUI `3848`. Use **`localhost` not `127.0.0.1`** for browser auth cookies.

## Compound build (long programmes)

For multi-slice roadmaps (lab factory, portal wiring, DSL waves):

- Follow [docs/operations/COMPOUND-BUILD-SOP.md](docs/operations/COMPOUND-BUILD-SOP.md) and [skills/compound-build-loop/SKILL.md](skills/compound-build-loop/SKILL.md).
- **Implementers must not self-SHIP** — only independent eval marks checklist rows done.
- **One integrator** runs `OPENROUTER_LIVE=1` live OpenRouter per slice eval (no parallel live calls).
- Gate stack: `./scripts/programme-gate.sh` on integration branch tip before bundle PR.

## Stack roles

| Role | System |
|------|--------|
| Visual orchestration | Dify Chatflow / Workflow / Agent |
| Models (lab) | OpenRouter plugin `langgenius/openrouter` |
| Models (prod) | Internal OpenAI-compatible gateway |
| Student UX | Existing student portal (BFF) → Dify App API |
| Optional demo chat | Open WebUI (`:slim`) — not default student path |

## Lab sample already provisioned

- App: **Member Benefits FAQ** (Chatflow / `advanced-chat`)
- Graph: Start → LLM → Answer
- Model: `meta-llama/llama-3.1-8b-instruct` via OpenRouter
- Editor: `/app/2615218e-4cd3-4f56-bad4-866a62c93627/workflow`
- Admin (local only): `lab-creds.env` (gitignored)

## Durable docs (read these first)

| Doc | Purpose |
|-----|---------|
| [HANDOFFs.md](HANDOFFs.md) | Colleague-facing index (status, run, GitHub handoff) |
| [llms.txt](llms.txt) | Agent brief at repo root |
| [docs/HANDOFF.md](docs/HANDOFF.md) | Shareable handoff (run, tenancy, screenshots, next steps) |
| [docs/PUBLIC_REPO.md](docs/PUBLIC_REPO.md) | GitHub + Origin: inbound mirror vs dual remotes |
| [docs/README.md](docs/README.md) | Docs index / hierarchy |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | Topology, ops boundaries, scale |
| [docs/SPEC_CAPABILITIES.md](docs/SPEC_CAPABILITIES.md) | What Dify CE can do for this course |
| [docs/REFERENCE_LINKS.md](docs/REFERENCE_LINKS.md) | Canonical Dify + lab reference links |
| [docs/ACTION_PLAN_COURSE_DELIVERY.md](docs/ACTION_PLAN_COURSE_DELIVERY.md) | Phased delivery plan for the outline |
| [docs/CURRICULUM_REFACTOR_N8N_TO_DIFY.md](docs/CURRICULUM_REFACTOR_N8N_TO_DIFY.md) | Module/lab mapping |
| [docs/DEPLOY_AND_STUDENT_TENANCY.md](docs/DEPLOY_AND_STUDENT_TENANCY.md) | Custom domain + portal BFF tenancy |
| [docs/HOW_TO_OPENROUTER_CANVAS.md](docs/HOW_TO_OPENROUTER_CANVAS.md) | Builder click path |
| [docs/memory/DECISIONS.md](docs/memory/DECISIONS.md) | Decision log |
| [docs/SCREENSHOT_PROTOCOL.md](docs/SCREENSHOT_PROTOCOL.md) | Vibium + Chrome screenshot capture |
| [docs/ENGINEERING_CRAFT.md](docs/ENGINEERING_CRAFT.md) | Modularity, DRY, compound loop |
| [docs/CONCEPTS.md](docs/CONCEPTS.md) | Vocabulary (blueprint, catalog, instance, wire) |
| [templates/lab-catalog.yaml](templates/lab-catalog.yaml) | 30 teachable labs (4+ per module) |
| [docs/solutions/](docs/solutions/) | Compound learnings |
| [docs/operations/COMPOUND-BUILD-SOP.md](docs/operations/COMPOUND-BUILD-SOP.md) | Long-horizon multi-agent build loop |
| [docs/operations/LAB-FACTORY-CHECKLIST.md](docs/operations/LAB-FACTORY-CHECKLIST.md) | Active programme checklist |

## Ops commands

```bash
cp .env.example .env          # OPENROUTER_API_KEY=
./scripts/ensure-docker.sh
./scripts/up.sh
./scripts/status.sh
./scripts/screenshots/capture-lab.sh   # regenerate lab PNGs (needs lab-creds.env for Studio)
```

## Context7 note

Prefer Context7 for Dify library docs when quota allows. If Context7 returns quota errors, use the official index: https://docs.dify.ai/llms.txt and the links in `docs/REFERENCE_LINKS.md`.
