# Enterprise AI Training Lab (Dify + Open WebUI)

Self-hosted **Dify Community Edition 1.17.1** for enterprise training, with optional **Open WebUI**. Models go through **OpenRouter** (operator keys only). Students authenticate in your portal; the portal BFF calls Dify’s Service API with `user=student:<id>`.

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

## Docs map

| Start here | Path |
|------------|------|
| Agent / project memory | [AGENTS.md](AGENTS.md) |
| Docs index | [docs/README.md](docs/README.md) |
| Architecture | [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) |
| Capability spec | [docs/SPEC_CAPABILITIES.md](docs/SPEC_CAPABILITIES.md) |
| Delivery action plan | [docs/ACTION_PLAN_COURSE_DELIVERY.md](docs/ACTION_PLAN_COURSE_DELIVERY.md) |
| Deploy + student tenancy | [docs/DEPLOY_AND_STUDENT_TENANCY.md](docs/DEPLOY_AND_STUDENT_TENANCY.md) |
| Decision log | [docs/memory/DECISIONS.md](docs/memory/DECISIONS.md) |
| Reference links | [docs/REFERENCE_LINKS.md](docs/REFERENCE_LINKS.md) |

## What not to commit

Never commit real keys or local credentials. Already gitignored:

- `.env` (copy from `.env.example`)
- `lab-creds.env` (local admin notes)
- `vendor/dify/docker/.env`, `volumes/`, and generated override copies

Rotate placeholder secrets in `lab/dify.env.overlay` before any shared or production use.

## Requirements

- Docker Engine 19.03+ and Compose **2.24.0+**
- Recommended: **≥8 GiB RAM** free for full Dify (lab uses lean worker counts; 4 GiB is the upstream minimum and is tight)
- Outbound HTTPS for image pulls, Dify Marketplace (OpenRouter plugin), and OpenRouter API calls

## Useful commands

```bash
./scripts/status.sh   # containers + HTTP probes (fail-soft if Docker is down)
./scripts/down.sh     # stop Dify + Open WebUI if present
```

Pinned Dify release: **1.17.1** (`vendor/DIFY_VERSION`, official `docker/` tree under `vendor/dify`).
