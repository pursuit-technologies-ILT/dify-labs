# Enterprise AI Training Lab (Dify)

Self-hosted **[Dify](https://dify.ai) Community Edition 1.17.1** for enterprise **no-code agentic AI** training — a practical **n8n replacement** for visual Chatflows/Workflows, with **OpenRouter** models (operator keys only) and a **portal BFF** path so students never need a Studio login.

Optional Open WebUI is available for demos; it is not the class delivery path.

## Public walkthrough (Vercel)

Dify cannot run on Vercel. The companion Next.js app under `web/` has a **single password gate**, then BYO OpenRouter key, then a deep-link (and iframe when allowed) to the **live Studio canvas** when a tunnel URL is configured.

```bash
cd web
cp .env.example .env.local   # set COLLAB_PASSWORD locally; never commit it
npm install
npm run dev -- --port 3849
```

Paste a key from [openrouter.ai/keys](https://openrouter.ai/keys). The key stays in the browser (`sessionStorage`) and is sent per request as `x-openrouter-key` to a Route Handler that proxies OpenRouter and does not store the key. There is no server-side OpenRouter key.

Public demo: [https://dify-labs-walkthrough.vercel.app](https://dify-labs-walkthrough.vercel.app)  
Studio email if Dify’s own form appears: `lab-admin@example.com` (same password as the walkthrough gate).

**Teardown ~2026-10-06:** remove `COLLAB_PASSWORD` from Vercel, take down any public tunnel to :3847, restore Dify URLs to localhost, rotate the Studio admin password. Shared-password Studio is demo-only, not the portal-BFF student path.

## Quickstart

```bash
cp .env.example .env
# edit .env → OPENROUTER_API_KEY=sk-or-...

./scripts/ensure-docker.sh   # sandbox / no-systemd only; skip if Docker already runs
./scripts/up.sh              # LAB_MODE=dify by default
./scripts/status.sh
```

Open **Dify**: http://localhost:3847/install  
Optional Open WebUI (`LAB_MODE=full`): http://localhost:3848

Use **`localhost`**, not `127.0.0.1`, in the browser so Studio auth cookies match the API host.

## Stack modes (`LAB_MODE` in `.env`)

| Mode | Services | When to use |
|------|----------|-------------|
| `dify` (default) | Dify only | Class delivery / lean RAM |
| `full` | Dify + Open WebUI | Optional ChatGPT-style demo |
| `webui` | Open WebUI only | Light chat UI smoke test |

## Ports

| Service | Host port |
|---------|-----------|
| Dify (nginx) | **3847** |
| Open WebUI | **3848** |
| Dify plugin debug (loopback only) | 15003 |

## Architecture (one screen)

```
Builders  →  Dify Studio (:3847)
Students  →  Portal IdP → BFF → Dify Service API /v1  (user=student:<portal_id>)
Optional  →  Open WebUI (:3848)  — demo only, not the class path
Models    →  OpenRouter plugin (lab)  /  internal gateway (prod)
```

Full topology, compose footprint, and scale notes: [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

## Why this lab

| Need | Approach here |
|------|----------------|
| Replace unapproved n8n | Dify Chatflow / Workflow / Agent canvas |
| One student login | Existing portal → BFF → App API + `user=` |
| Lab models without many vendor keys | OpenRouter plugin (`langgenius/openrouter`) |
| Reproducible instructor materials | Vibium + Chrome screenshot protocol |
| Lean laptop RAM | Default `LAB_MODE=dify`, worker counts = 1 |

## Docs map

| Start here | Path |
|------------|------|
| **Handoff (share this)** | [docs/HANDOFF.md](docs/HANDOFF.md) |
| GitHub + Origin (mirror vs dual remotes) | [docs/PUBLIC_REPO.md](docs/PUBLIC_REPO.md) |
| Agent / project memory | [AGENTS.md](AGENTS.md) |
| Docs index | [docs/README.md](docs/README.md) |
| Architecture | [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) |
| Capability spec | [docs/SPEC_CAPABILITIES.md](docs/SPEC_CAPABILITIES.md) |
| Delivery action plan | [docs/ACTION_PLAN_COURSE_DELIVERY.md](docs/ACTION_PLAN_COURSE_DELIVERY.md) |
| Deploy + student tenancy | [docs/DEPLOY_AND_STUDENT_TENANCY.md](docs/DEPLOY_AND_STUDENT_TENANCY.md) |
| Decision log | [docs/memory/DECISIONS.md](docs/memory/DECISIONS.md) |
| Screenshot protocol (Vibium) | [docs/SCREENSHOT_PROTOCOL.md](docs/SCREENSHOT_PROTOCOL.md) |
| Lab shot list | [docs/lab-materials/SHOT_LIST.md](docs/lab-materials/SHOT_LIST.md) |

## What not to commit

Never commit real keys or local credentials. Already gitignored:

- `.env` (copy from `.env.example`)
- `lab-creds.env` (local admin notes)
- `web/.env.local` (`COLLAB_PASSWORD` for the walkthrough gate)
- `vendor/dify/docker/.env`, `volumes/`, and generated override copies
- `artifacts/screenshots/` bulk runs (regenerate with the capture script)
- `tools/vibium/node_modules/`

Rotate placeholder secrets in `lab/dify.env.overlay` before any shared or production use.

## Requirements

- Docker Engine 19.03+ and Compose **2.24.0+**
- Recommended: **≥8 GiB RAM** free for full Dify (lab uses lean worker counts; 4 GiB is the upstream minimum and is tight)
- Outbound HTTPS for image pulls, Dify Marketplace (OpenRouter plugin), and OpenRouter API calls

## Useful commands

```bash
./scripts/status.sh   # containers + HTTP probes (fail-soft if Docker is down)
./scripts/down.sh     # stop Dify + Open WebUI if present
./scripts/screenshots/capture-lab.sh   # Vibium + Chrome proof / worksheet PNGs
```

Pinned Dify release: **1.17.1** (`vendor/DIFY_VERSION`, official `docker/` tree under `vendor/dify`).
