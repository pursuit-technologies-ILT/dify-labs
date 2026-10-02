# Decision log (long-term memory)

Append-only. Newest at bottom.

## 2026-10-01 — Platform choice

- **Decision:** Use **Dify Community Edition** as the n8n replacement for enterprise training.
- **Why:** Visual builder + published Apps + RAG + logs; privatizable via Docker Compose; cleaner trainee surfaces than n8n.
- **Alternatives considered:** Flowise (lighter, weak RBAC); Open WebUI alone (great chat UX, weak visual workflow IDE).
- **Refs:** `docs/COMPARISON.md`, `docs/ENTERPRISE_REVIEW.md`

## 2026-10-01 — Model access

- **Decision:** Lab models via **OpenRouter** plugin; production via internal LLM gateway.
- **Why:** Single key for many models in lab; OpenRouter is a provider only — canvas unchanged.
- **Light default for tests:** `meta-llama/llama-3.1-8b-instruct` (or `llama-3.2-1b-instruct`).
- **Refs:** `docs/HOW_TO_OPENROUTER_CANVAS.md`, Marketplace `langgenius/openrouter`

## 2026-10-01 — Student access / tenancy

- **Decision:** Students authenticate **only** in the existing student portal. Portal BFF calls Dify Service API with App API key + `user=student:<portal_id>`.
- **Why:** CE has public webapp access but weak identity; Dify documents `user` as the end-user scope for conversations/files without Dify authenticating it. Avoids second login.
- **Avoid:** Per-student Dify Studio or Open WebUI accounts for class cohorts.
- **Refs:** https://docs.dify.ai/en/api-reference/guides/end-user-identity , `docs/DEPLOY_AND_STUDENT_TENANCY.md`

## 2026-10-01 — Builder vs trainee surfaces

- **Decision:** Instructors use Studio; trainees never see the node canvas in production class delivery.
- **Why:** Course audience is non-technical business users; enterprise constraint is “pre-made elements.”
- **Exception:** Optional instructor-led Studio demos for Modules 1–4 builders track if the org later adds a builder cohort.

## 2026-10-02 — Documentation source of truth

- **Decision:** Treat https://docs.dify.ai/llms.txt as the canonical docs index for specs. Context7 is preferred when available; if quota-blocked, use the official index directly.
- **Pinned product version in lab:** Dify **1.17.1**.
