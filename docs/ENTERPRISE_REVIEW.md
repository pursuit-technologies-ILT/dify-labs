# Enterprise infrastructure review — Dify lab notes

Investigation target: **Dify Community Edition 1.17.1** self-hosted via official Docker Compose, optionally paired with **Open WebUI (`:slim`)** for trainee chat.

## Verdict for a corporate training portal (lab stance)

Dify clears a typical “single private Docker deployment + clean trainee UI” bar **if**:

1. Default published ports and debug endpoints are locked down (this lab does that).
2. Stock secrets in `.env` are rotated before any shared environment.
3. Outbound allowlists cover Marketplace + your model gateway (OpenRouter or internal LLM gateway).
4. Builders use Dify Studio; trainees only get **published Apps** (or Open WebUI pointed at App APIs).

Flowise is lighter but weak on seats/RBAC. Open WebUI alone is strongest for ChatGPT-familiar UX + RBAC, weakest as a visual workflow IDE.

## What Compose actually starts (default profiles in this lab)

Lab overlay sets `COMPOSE_PROFILES=weaviate,postgresql` and disables the `collaboration` profile to save RAM.

| Role | Containers (lab) |
|------|------------------|
| App plane | `api`, `worker`, `worker_beat`, `web`, `plugin_daemon`, `agent_backend` |
| Data plane | `db_postgres`, `redis`, `weaviate` |
| Safety | `sandbox`, `local_sandbox`, `ssrf_proxy`, `agent_ssrf_proxy` |
| Edge | `nginx` |
| One-shot | `init_permissions` (exits) |

Upstream “full” also adds `api_websocket` when `collaboration` is enabled.

## Network exposure (stock vs this lab)

| Endpoint | Stock Dify | This lab |
|----------|------------|----------|
| Web UI / API | `0.0.0.0:80` | `0.0.0.0:3847` |
| HTTPS | `0.0.0.0:443` | `38443` (unused unless TLS enabled) |
| Plugin debugging | `0.0.0.0:5003` | **`127.0.0.1:15003` only** |
| Postgres / Redis / Weaviate | internal | internal (not published) |

**Review ask:** confirm host firewall only allows corporate clients to `3847`/`3848`, and that plugin debug stays loopback.

## Secrets & governance checklist

Must change before any non-solo use (lab overlay uses obvious placeholders):

- `SECRET_KEY`, `DB_PASSWORD`, `REDIS_PASSWORD` / `CELERY_BROKER_URL`
- `WEAVIATE_API_KEY` (+ matching Weaviate auth keys)
- `SANDBOX_API_KEY` / `CODE_EXECUTION_API_KEY`
- `PLUGIN_DAEMON_KEY`, `PLUGIN_DIFY_INNER_API_KEY`
- `DIFY_AGENT_API_TOKEN`, `DIFY_AGENT_SERVER_SECRET_KEY`
- Open WebUI `WEBUI_SECRET_KEY`

Dify has workspace membership and App publishing; Open WebUI adds **RBAC** (admin vs user) suitable for trainee isolation once signup is disabled after account creation.

## Outbound / air-gap

| Destination | Needed for |
|-------------|------------|
| Container registries (Docker Hub, GHCR, Weaviate CR, etc.) | Initial image pull |
| `https://marketplace.dify.ai` | OpenRouter plugin install (`MARKETPLACE_ENABLED=true`) |
| `https://openrouter.ai` | Model inference when using OpenRouter |
| `https://updates.dify.ai` | Update check (`CHECK_UPDATE_URL`) — optional to block |

Air-gapped: pre-load images, disable Marketplace, install plugins offline, and point model providers at an **internal** OpenAI-compatible gateway instead of OpenRouter.

## SSRF / code execution

Dify runs untrusted workflow code in `sandbox` and forces egress through `ssrf_proxy` (Squid). For internal LLM gateways on private CIDRs, set `SSRF_PROXY_ALLOW_PRIVATE_IPS` explicitly — default deny-by-default is correct for enterprise.

## Resource profile (lab)

- Upstream minimum: 2 CPU / 4 GiB RAM (tight).
- This lab: `CELERY_WORKER_AMOUNT=1`, `SERVER_WORKER_AMOUNT=1`, no collaboration websocket.
- Expect multi-GB image pulls on first `up`.

## Residual risks to flag in infra review

1. **Multi-container blast radius** — compromise of `api` still reaches DB/Redis/vector store on the compose network.
2. **Plugin supply chain** — Marketplace packages; signature verification is on (`FORCE_VERIFYING_SIGNATURE=true`).
3. **Trainee data** — chat/logs live in Postgres + Open WebUI volume; define retention before production training cohorts.
4. **No SSO in CE out of the box** — plan IdP separately if required by enterprise IAM.

## Recommended training topology

```
Builders  →  Dify Studio (workflows / Apps)
Trainees  →  Dify App UI  OR  Open WebUI → Dify OpenAI-compatible App API
Models    →  OpenRouter (lab)  OR  private Azure OpenAI / vLLM / Bedrock (prod)
```
