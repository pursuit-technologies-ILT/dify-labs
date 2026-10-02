# Enterprise AI Training Lab (Dify + Open WebUI)

Self-hosted lab for **Dify Community Edition** as an enterprise training backend, with optional **Open WebUI**. Models go through **OpenRouter** (operator keys only).

## What you do

1. Copy keys file and paste your OpenRouter key:
   ```bash
   cp .env.example .env
   # edit .env → OPENROUTER_API_KEY=sk-or-...
   ```
2. Start the lab:
   ```bash
   ./scripts/ensure-docker.sh   # sandbox only (no systemd)
   ./scripts/up.sh
   ```
3. Open **Dify**: http://localhost:3847/install  
   Optional Open WebUI (`LAB_MODE=full`): http://localhost:3848

That is the whole operator loop. Everything else is scripted.

## Stack modes (`LAB_MODE` in `.env`)

| Mode | Services | When to use |
|------|----------|-------------|
| `dify` (default) | Dify only | Class delivery / lean RAM |
| `full` | Dify + Open WebUI | Optional ChatGPT-style demo |
| `webui` | Open WebUI only | Light chat UI smoke test |

## Ports (intentionally non-default)

| Service | Host port |
|---------|-----------|
| Dify (nginx) | **3847** |
| Open WebUI | **3848** |
| Dify plugin debug (loopback only) | 15003 |

## Docs

- [AGENTS.md](AGENTS.md) — project memory
- [Architecture](docs/ARCHITECTURE.md) — topology, compose footprint, scale
- [Capability spec](docs/SPEC_CAPABILITIES.md)
- [Action plan](docs/ACTION_PLAN_COURSE_DELIVERY.md)
- [Reference links](docs/REFERENCE_LINKS.md)
- [Decision log](docs/memory/DECISIONS.md)
- [Curriculum map](docs/CURRICULUM_REFACTOR_N8N_TO_DIFY.md)
- [OpenRouter canvas how-to](docs/HOW_TO_OPENROUTER_CANVAS.md)
- [Deploy + student tenancy](docs/DEPLOY_AND_STUDENT_TENANCY.md)

## Requirements

- Docker Engine 19.03+ and Compose **2.24.0+**
- Recommended: **≥8 GiB RAM** free for full Dify (lab uses lean worker counts; 4 GiB is the upstream minimum and is tight)
- Outbound HTTPS for image pulls, Dify Marketplace (OpenRouter plugin), and OpenRouter API calls

## Useful commands

```bash
./scripts/status.sh   # containers + HTTP probes
./scripts/down.sh     # stop everything
```

Pinned Dify release: **1.17.1** (official `docker/` compose under `vendor/dify`).
