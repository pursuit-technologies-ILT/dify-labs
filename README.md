# Enterprise AI Training Lab (Dify + Open WebUI)

Self-hosted lab for investigating **Dify Community Edition** as an enterprise training portal, with optional **Open WebUI** as the trainee chat front end. Models go through **OpenRouter** (you only paste keys).

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
3. Open:
   - **Dify** (builders / admins): http://localhost:3847/install
   - **Open WebUI** (trainees): http://localhost:3848

That is the whole operator loop. Everything else is scripted.

## Stack modes (`LAB_MODE` in `.env`)

| Mode | Services | When to use |
|------|----------|-------------|
| `full` (default) | Dify + Open WebUI | Training portal investigation |
| `dify` | Dify only | Infra / compose review |
| `webui` | Open WebUI only | Light chat UI smoke test |

## Ports (intentionally non-default)

| Service | Host port |
|---------|-----------|
| Dify (nginx) | **3847** |
| Open WebUI | **3848** |
| Dify plugin debug (loopback only) | 15003 |

## Docs

- [Curriculum refactor: n8n → Dify](docs/CURRICULUM_REFACTOR_N8N_TO_DIFY.md) — module/lab mapping for the health-insurance course
- [How to: OpenRouter + drag-and-drop canvas](docs/HOW_TO_OPENROUTER_CANVAS.md) — click path + lab sample Chatflow
- [Deploy + student tenancy (minimal logins)](docs/DEPLOY_AND_STUDENT_TENANCY.md) — custom domain + portal BFF pattern
- [Enterprise infrastructure review notes](docs/ENTERPRISE_REVIEW.md) — containers, exposure, outbound, secrets
- [OpenRouter + trainee portal wiring](docs/OPENROUTER_AND_PORTAL.md) — plugin, API mapping, RBAC path
- [Comparison snapshot](docs/COMPARISON.md) — Dify vs Flowise vs Open WebUI for this use case

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
