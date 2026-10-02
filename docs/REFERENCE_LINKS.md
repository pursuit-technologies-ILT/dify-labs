# Reference links (canonical)

Keep this list short and authoritative. Prefer these over blog roundups.

## Dify — official

| Topic | Link |
|-------|------|
| Docs LLM index (crawl root) | https://docs.dify.ai/llms.txt |
| Self-Host index | https://docs.dify.ai/_llms/en/self-host.md |
| Cloud index | https://docs.dify.ai/_llms/en/cloud.md |
| Key concepts | https://docs.dify.ai/en/learn/key-concepts |
| End-user identity (`user` field) | https://docs.dify.ai/en/api-reference/guides/end-user-identity |
| Service OpenAPI | https://docs.dify.ai/en/api-reference/openapi_service.json |
| Docker Compose quick start | https://docs.dify.ai/en/self-host/deploy/quick-start/docker-compose |
| Environment variables | https://docs.dify.ai/en/self-host/deploy/configuration/environments |
| GitHub (source / releases) | https://github.com/langgenius/dify |
| Release used in lab | https://github.com/langgenius/dify/releases/tag/1.17.1 |

### Self-Host sections to revisit (from docs index)

Use the Self-Host index and drill into:

- **Deploy** → Docker Compose, Environment Variables, Troubleshooting  
- **Use → Orchestrate** → Workflow & Chatflow, Nodes (LLM, Knowledge, Agent, Human Input, HTTP, Tools, …)  
- **Use → Publish** → Web App, Embed, MCP Server, Marketplace publish  
- **Use → Knowledge** → Create / Manage / External knowledge API  
- **Use → Integrations** → Model Providers, Tools  
- **Use → Monitor** → Dashboard, Logs, Annotations  
- **Learn → Tutorials** → Workflow 101 lessons 1–10, Customer Service Bot with KB  

## OpenRouter

| Topic | Link |
|-------|------|
| OpenRouter home | https://openrouter.ai |
| API keys | https://openrouter.ai/keys |
| Credits | https://openrouter.ai/settings/credits |
| Dify Marketplace plugin | https://marketplace.dify.ai/plugin/langgenius/openrouter |
| Works-with listing | https://openrouter.ai/works-with-openrouter |

## Open WebUI (optional)

| Topic | Link |
|-------|------|
| Site | https://openwebui.com |
| Docs quick start | https://docs.openwebui.com/getting-started/quick-start/ |
| Image (lab uses slim) | `ghcr.io/open-webui/open-webui:slim` |

## Alternatives researched (background only)

| Platform | Link |
|----------|------|
| Flowise | https://flowiseai.com |
| Lab comparison / topology | [ARCHITECTURE.md](./ARCHITECTURE.md) |

## In-repo durable docs

| Doc | Path |
|-----|------|
| Agent memory | [/AGENTS.md](../AGENTS.md) |
| Architecture | [ARCHITECTURE.md](./ARCHITECTURE.md) |
| Decisions | [memory/DECISIONS.md](./memory/DECISIONS.md) |
| Capabilities spec | [SPEC_CAPABILITIES.md](./SPEC_CAPABILITIES.md) |
| Curriculum map | [CURRICULUM_REFACTOR_N8N_TO_DIFY.md](./CURRICULUM_REFACTOR_N8N_TO_DIFY.md) |
| Course blurb (Dify) | [COURSE_DESCRIPTION_DIFY.md](./COURSE_DESCRIPTION_DIFY.md) |
| Delivery action plan | [ACTION_PLAN_COURSE_DELIVERY.md](./ACTION_PLAN_COURSE_DELIVERY.md) |
| Deploy + tenancy | [DEPLOY_AND_STUDENT_TENANCY.md](./DEPLOY_AND_STUDENT_TENANCY.md) |
| OpenRouter canvas how-to | [HOW_TO_OPENROUTER_CANVAS.md](./HOW_TO_OPENROUTER_CANVAS.md) |

## Lab runtime bookmarks

| What | URL |
|------|-----|
| Dify Studio | http://localhost:3847 |
| Sample Chatflow editor | http://localhost:3847/app/2615218e-4cd3-4f56-bad4-866a62c93627/workflow |
| Open WebUI | http://localhost:3848 |
| Public chat path pattern | http://localhost:3847/chat/{site_code} |

## Context7

- Server: Context7 MCP (`resolve-library-id`, `query-docs`)  
- Status as of 2026-10-02: **quota exceeded** after re-auth — use official `llms.txt` until reset  
- When available, resolve **Dify** and query by topic (publish, chatflow nodes, knowledge, API `user`)
