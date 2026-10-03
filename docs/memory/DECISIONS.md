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

## 2026-10-02 — Lab screenshots via Vibium + Chrome

- **Decision:** Use **Vibium** (npm `vibium@26.8.21`) driving **Chrome** from the terminal as the durable screenshot tool for proof shots and instructor “what to click” materials. Entry point: `./scripts/screenshots/capture-lab.sh` → `tools/vibium/capture-lab.js`. Protocol: `docs/SCREENSHOT_PROTOCOL.md`; module list: `docs/lab-materials/SHOT_LIST.md`.
- **Why:** User/instructor requirement for Vibium + Chrome; zero-config BiDi automation; regenerable PNGs without committing large binary dumps. Playwright remains an explicit fallback only if Vibium cannot launch Chrome.
- **Outputs:** `artifacts/screenshots/` (gitignored bulk + manifest), curated mirrors under `docs/lab-materials/screenshots/`, optional copy to `/opt/cursor/artifacts/screenshots/`.
- **Constraints unchanged:** Dify CE 1.17.1, `localhost` (not `127.0.0.1`) for Studio cookies, OpenRouter keys-only, portal BFF tenancy, no secrets in git.
- **Refs:** `docs/SCREENSHOT_PROTOCOL.md`, `tools/vibium/`, `scripts/screenshots/capture-lab.sh`

## 2026-10-02 — Handoff + public showcase repo

- **Decision:** Ship continuity as in-repo `docs/HANDOFF.md` (+ `docs/PUBLIC_REPO.md`); keep README as the public front door. Prefer GitHub **public** under owner `manutej` named `dify-training-lab` for showcase.
- **Why:** User asked for a shareable handoff and a public org/user repo. Evidence: Origin/Cursor remote `manutej/tmp-*`, GitHub user `manutej` (personal account; orgs list empty), email `manutej@gmail.com`.
- **Blocker (agent session):** `gh` unauthenticated; Origin token scoped to temp private repo (cannot `origin repo create`); Origin visibility has no `public`; no GitHub SSH. Documented unblock steps in `docs/PUBLIC_REPO.md`.
- **Also:** Vercel Publish button hidden — Docker Compose lab is not a Vercel web app.
- **Refs:** `docs/HANDOFF.md`, `docs/PUBLIC_REPO.md`, `README.md`

## 2026-10-03 — Origin + GitHub together (no in-place Origin→GitHub auto-mirror)

- **Decision:** Keep **Origin-hosted** `manutej/dify-labs` as the current private SoT. Add a **public GitHub** repo (`manutej/dify-labs` preferred, `dify-training-lab` fallback) created by the user. Sync options: (A) GitHub-first **inbound mirror** via Sync from GitHub / `origin repo create-mirrored` (GitHub SoT; new Origin copy); (B) dual remotes `origin` + `github` and `scripts/sync-github.sh` (manual Origin→GitHub).
- **Why:** `origin repo view` shows `mirrorStatus: no-mirror`, `githubInstallationId: null`. `origin repo mirror transition --to inbound|outbound` refuses from `no-mirror`. Origin CLI/API support inbound GitHub→Origin live sync, not converting this Origin-only repo into an outbound GitHub push-mirror. Cloud agent still cannot `gh repo create` (no GitHub login / token).
- **Do not claim:** a GitHub URL exists until the user (or a `GITHUB_TOKEN`) creates it and a browser/API check returns 200.
- **Refs:** `docs/PUBLIC_REPO.md`, https://cursor.com/docs/origin/mirror-github

## 2026-10-03 — Collaborator walkthrough: shared password, BYO OpenRouter, tunneled canvas

- **Decision:** Add a single password gate on the Vercel companion (`COLLAB_PASSWORD` / httpOnly cookie). Collaborators bring their own OpenRouter key (sessionStorage + `x-openrouter-key`; never hardcoded). Expose the real Dify Studio canvas via a public HTTPS tunnel to nginx :3847 when the VM allows it. Align Dify admin password to the same temp secret; email remains `lab-admin@example.com`.
- **Why:** Requested collaborator access to the actual Chatflow editor, not screenshots, without a second distinct password and without embedding operator OpenRouter keys.
- **Not production:** Shared-password public Studio is demo-only. Class path remains portal IdP → BFF → Service API. Teardown ~**2026-10-06**.
- **Refs:** `web/src/proxy.ts`, `docs/HANDOFF.md` teardown list, `scripts/tunnel-dify.sh`

