# Decision log (long-term memory)

Append-only. Newest at bottom.

## 2026-10-01 — Platform choice

- **Decision:** Use **Dify Community Edition** as the n8n replacement for enterprise training.
- **Why:** Visual builder + published Apps + RAG + logs; privatizable via Docker Compose; cleaner trainee surfaces than n8n.
- **Alternatives considered:** Flowise (lighter, weak RBAC); Open WebUI alone (great chat UX, weak visual workflow IDE).
- **Refs:** `docs/ARCHITECTURE.md`

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

## 2026-10-02 — Ops / architecture trim

- **Decision:** Keep five ops scripts + shared `scripts/lib.sh`. Default `LAB_MODE=dify`. Host port/URLs driven only by `DIFY_HOST_PORT`. Consolidate comparison / enterprise review / portal wiring into `docs/ARCHITECTURE.md`.
- **Why:** Dual URL sources in overlay + root `.env` were brittle; default `full` started optional Open WebUI against the portal-BFF tenancy decision; overlapping docs hid the operator path.
- **Not changed:** Dify CE pin, OpenRouter keys-only, portal BFF `user=` tenancy, Open WebUI compose file (opt-in via `LAB_MODE=full`).
- **Refs:** `docs/ARCHITECTURE.md`, `scripts/lib.sh`

## 2026-10-02 — Craft / publish readiness

- **Decision:** Treat README + `docs/README.md` as the public-repo front door. Status/down scripts fail soft when Docker is unavailable; boundary checks live in `scripts/lib.sh`. Do not add a separate `docs/CRAFT.md`.
- **Why:** manutej/craft (robustness-at-boundaries, right-sized-design, naming): operators need clear errors and a short docs hierarchy, not another standards file.
- **Refs:** `README.md`, `docs/README.md`, `scripts/status.sh`, `scripts/lib.sh`
