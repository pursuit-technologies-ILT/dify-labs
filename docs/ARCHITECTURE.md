# Lab architecture

Self-hosted **Dify CE 1.17.1** is the orchestration platform. **Open WebUI** is an optional demo chat front end. Students authenticate only in the existing portal; the portal BFF calls Dify’s Service API.

## Topology

```
Builders   →  Dify Studio (:3847)
Students   →  Portal (IdP) → BFF → Dify Service API /v1  (user=student:<portal_id>)
Optional   →  Open WebUI (:3848) → Dify App API   (demo only; not default class path)
Models     →  OpenRouter plugin (lab)  OR  internal OpenAI-compatible gateway (prod)
```

| Role | System |
|------|--------|
| Visual orchestration | Dify Chatflow / Workflow / Agent |
| Models (lab) | OpenRouter `langgenius/openrouter` |
| Models (prod) | Internal LLM gateway |
| Student UX | Portal BFF → App API key + `user=` |
| Optional demo chat | Open WebUI `:slim` |

## Operator entrypoints

| Path | Purpose |
|------|---------|
| `.env` (from `.env.example`) | Operator keys only (`OPENROUTER_API_KEY`, ports, `LAB_MODE`) |
| `lab/dify.env.overlay` | Lean RAM, profiles, lab placeholder secrets |
| `lab/docker-compose.override.yml` | Host port / `lab_net` / plugin-debug loopback |
| `scripts/up.sh` | Ensure Docker → bootstrap vendor overlays → start stack |
| `scripts/status.sh` / `down.sh` | Probe / stop |

`DIFY_HOST_PORT` is the single source for nginx publish port and localhost URL knobs. Bootstrap always writes those into `vendor/dify/docker/.env`.

## Stack modes (`LAB_MODE`)

| Mode | Services | Use |
|------|----------|-----|
| `dify` (default) | Dify | Class delivery / infra review / lean RAM |
| `full` | Dify + Open WebUI | Optional ChatGPT-style demo |
| `webui` | Open WebUI only | Light UI smoke test |

## Why Dify (not Flowise / Open WebUI alone)

| | Dify (primary) | Flowise | Open WebUI alone |
|--|----------------|---------|------------------|
| Trainee UX | Published Apps + API | Share / embed | Chat UI |
| Builder UX | Visual workflows + RAG | Node canvas | Weak as workflow IDE |
| Deploy | Multi-container Compose | Single container | Single container |
| Governance | App logs, workspaces | Thin | Chat RBAC |
| RAM | Highest (lab uses lean workers) | Lowest | Low–medium |

## Compose footprint (this lab)

Overlay: `COMPOSE_PROFILES=weaviate,postgresql`, collaboration off, worker counts = 1.

| Plane | Containers |
|-------|------------|
| App | `api`, `worker`, `worker_beat`, `web`, `plugin_daemon`, `agent_backend` |
| Data | `db_postgres`, `redis`, `weaviate` |
| Safety | `sandbox`, `local_sandbox`, `ssrf_proxy`, `agent_ssrf_proxy` |
| Edge | `nginx` |

| Endpoint | Stock Dify | This lab |
|----------|------------|----------|
| Web / API | `:80` | `:3847` |
| Plugin debug | `0.0.0.0:5003` | `127.0.0.1:15003` |
| DB / Redis / Weaviate | internal | internal |

## Horizontal scale (many students)

One shared Dify instance. Isolation is `user=student:<portal_id>` on the Service API with a server-side App API key. Do **not** create per-student Dify Studio or Open WebUI accounts for cohorts. Scale bottlenecks are API/worker RAM and model gateway rate limits — not portal login count.

## Secrets & outbound

Rotate every placeholder in `lab/dify.env.overlay` before shared use. Outbound needs: registries (first pull), `marketplace.dify.ai` (OpenRouter plugin), model gateway. Air-gap: preload images, install plugins offline, point providers at an internal gateway. For private-CIDR gateways, set `SSRF_PROXY_ALLOW_PRIVATE_IPS` — default deny-by-default is correct.

## Residual risks

1. Multi-container blast radius on the compose network.
2. Marketplace plugin supply chain (signature verify stays on upstream).
3. Chat/logs retention in Postgres (and Open WebUI volume if used).
4. No SSO in CE by default — portal remains the student IdP.

## Open WebUI wiring (optional)

Prefer OpenRouter configured **only in Dify**. Point Open WebUI at the published App:

- URL: `http://host.docker.internal:3847/v1` (or `http://nginx/v1` on `lab_net`)
- Key: Dify App API key

`docker-compose.open-webui.yml` can pass `OPENROUTER_API_KEY` for a direct smoke test; that path is not the training design.

Builder click path: [HOW_TO_OPENROUTER_CANVAS.md](./HOW_TO_OPENROUTER_CANVAS.md). Portal BFF: [DEPLOY_AND_STUDENT_TENANCY.md](./DEPLOY_AND_STUDENT_TENANCY.md).
