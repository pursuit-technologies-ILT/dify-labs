# Platform comparison (training portal lens)

Context: restricted corporate network, n8n unapproved, non-technical trainees, prefer single Docker-style private deploy, builders prepare templates ahead of time.

| | **Dify (lab primary)** | **Flowise** | **Open WebUI** |
|--|------------------------|-------------|----------------|
| Trainee UX | Published Apps (chat/forms/run) | Share link / embed widget | ChatGPT-like chat |
| Builder UX | Visual workflows + prompt IDE + RAG | Node canvas | Pipelines/functions (less visual IDE) |
| Deploy | Multi-container Compose | Single container | Single container |
| Access control | Workspaces, accounts, App keys | Global basic auth / tokens | Built-in RBAC |
| Governance / logs | Stronger (app logs, seats) | Thin | Chat + admin roles |
| RAM footprint | Highest | Lowest | Low–medium (`:slim` helps) |
| OpenRouter | Official Marketplace plugin | Via OpenAI-compatible nodes | Native OpenAI-compatible connection |

## Lab recommendation

1. **Investigate Dify Compose** for enterprise infra review (this repo).
2. Use **Open WebUI** when you need familiar chat + RBAC in front of Dify App APIs.
3. Keep **Flowise** as a fallback only if infra rejects multi-container Dify and basic-auth is acceptable.

## Suggested phased lab path

1. `LAB_MODE=dify` — clear infra checklist (ports, secrets, outbound).
2. `LAB_MODE=full` — wire OpenRouter + one sample App + Open WebUI connection.
3. Document SSO/IdP gap and retention for production hardening (out of scope for CE defaults).
