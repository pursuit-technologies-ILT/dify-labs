# Handoff — Dify Training Lab

**Audience:** instructors, portal eng, or a fresh agent continuing this work.  
**Captured:** 2026-10-02 · branch `main` · Dify CE **1.17.1**  
**Intent (user):** showcase-ready public repo + continuity handoff for the self-hosted Dify lab (n8n replacement).

---

## What this project is

Self-hosted **Dify Community Edition** lab for the 2-day course *No-Code Agentic AI: Building Business Automation* (synthetic health-insurance scenarios). It replaces **n8n** with visual Chatflow/Workflow builders, OpenRouter models (operator keys only), and a **portal BFF** student path so trainees never log into Dify Studio.

Optional **Open WebUI** is demo-only (`LAB_MODE=full`), not the class path.

---

## How to run (operator)

```bash
cp .env.example .env
# set OPENROUTER_API_KEY=sk-or-...  (never commit .env)

./scripts/ensure-docker.sh   # only if Docker is not already running
./scripts/up.sh              # LAB_MODE=dify by default
./scripts/status.sh
```

Open **http://localhost:3847/install** (use **`localhost`**, not `127.0.0.1`, so Studio cookies match the API host).

| Mode | Services |
|------|----------|
| `dify` (default) | Dify only — class delivery |
| `full` | Dify + Open WebUI `:3848` |
| `webui` | Open WebUI only |

Pinned release: `vendor/DIFY_VERSION` → **1.17.1**. Ops entrypoints: `scripts/up.sh`, `down.sh`, `status.sh`, `bootstrap.sh`, `lib.sh`.

---

## Architecture (one screen)

```
Builders  →  Dify Studio (:3847)
Students  →  Portal IdP → BFF → Dify Service API /v1  (user=student:<portal_id>)
Optional  →  Open WebUI (:3848)  — demo only
Models    →  OpenRouter plugin (lab)  /  internal gateway (prod)
```

Authoritative detail: [ARCHITECTURE.md](./ARCHITECTURE.md). Tenancy / custom domain: [DEPLOY_AND_STUDENT_TENANCY.md](./DEPLOY_AND_STUDENT_TENANCY.md).

**Isolation model:** one shared Dify instance; per-student scope is the Service API `user=` string with a server-side App API key. Do **not** create per-student Studio or Open WebUI accounts for cohorts.

---

## Temporary collaborator demo (expires ~2026-10-06)

Public Vercel walkthrough: [https://dify-labs-walkthrough.vercel.app](https://dify-labs-walkthrough.vercel.app)

This is **demo-only**, not the production portal-BFF student path. One shared password (`COLLAB_PASSWORD` on Vercel; never in git) gates the site with an httpOnly session cookie. Collaborators still paste their **own** OpenRouter key (`sessionStorage` + `x-openrouter-key`). Dify Studio admin email stays `lab-admin@example.com`; the console password is aligned to the same temp secret so there is not a second distinct password.

Live canvas requires a public HTTPS tunnel to nginx **:3847** plus Dify URL env (`CONSOLE_WEB_URL`, `APP_WEB_URL`, `FILES_URL`, `NEXT_PUBLIC_SOCKET_URL`, …) pointed at that host. Helpers: `./scripts/tunnel-dify.sh`, `./scripts/apply-dify-public-url.sh`, `COLLAB_PASSWORD=… ./scripts/set-dify-admin-password.sh`.

### Teardown action items (~2026-10-06)

1. Remove Vercel env `COLLAB_PASSWORD` / `DEMO_PASSWORD` / `COLLAB_SESSION_SECRET` and `NEXT_PUBLIC_DIFY_STUDIO_URL`.
2. Stop the public tunnel; restore Dify URLs with `./scripts/apply-dify-public-url.sh --localhost`.
3. Restore the Dify admin password (no longer the shared demo secret).
4. Disable public Studio access.
5. Treat any leftover shared password as compromised.

Studio LLM nodes may still use the lab OpenRouter plugin credential. Walkthrough chat/test uses the visitor’s key and does not require injecting it into Dify.

---

## Screenshot protocol (lab materials)

| Piece | Path / command |
|-------|----------------|
| Protocol | [SCREENSHOT_PROTOCOL.md](./SCREENSHOT_PROTOCOL.md) |
| Shot list | [lab-materials/SHOT_LIST.md](./lab-materials/SHOT_LIST.md) |
| Capture | `./scripts/screenshots/capture-lab.sh` → `tools/vibium/capture-lab.js` |
| Curated PNGs | `docs/lab-materials/screenshots/` (tracked, small) |
| Bulk runs | `artifacts/screenshots/` (**gitignored** — regenerate) |

Prereqs: lab up, Node ≥ 18, `cd tools/vibium && npm install`. Studio login shots need local `lab-creds.env` (gitignored). Always browse `http://localhost:3847`.

---

## Credentials boundaries (do not put in git)

| File | Role | In git? |
|------|------|---------|
| `.env` | Operator keys (`OPENROUTER_API_KEY`, ports, `LAB_MODE`) | **No** — copy from `.env.example` |
| `lab-creds.env` | Local Dify admin email/password for screenshots | **No** |
| `lab/dify.env.overlay` | Lean RAM + **placeholder** compose secrets | Yes — **rotate before shared/prod** |
| `vendor/dify/docker/.env`, `volumes/` | Generated runtime | **No** (gitignore) |
| Dify App API keys | Portal secret store | **Never** in git |

Non-negotiables (also in [AGENTS.md](../AGENTS.md)): n8n out; builders = Studio; students = portal only; keys from operator; pin 1.17.1; `localhost` for cookies.

---

## Lab sample already provisioned (local runtime)

When the stack has been installed once on a machine:

- App: **Member Benefits FAQ** (Chatflow / `advanced-chat`)
- Graph: Start → LLM → Answer
- Model: `meta-llama/llama-3.1-8b-instruct` via OpenRouter
- Editor path: `/app/2615218e-4cd3-4f56-bad4-866a62c93627/workflow`

App IDs and admin passwords are **environment-local**; do not treat them as portable secrets across hosts.

---

## Docs map (read order)

1. [../AGENTS.md](../AGENTS.md) — non-negotiables  
2. [ARCHITECTURE.md](./ARCHITECTURE.md) — topology / scale  
3. [SPEC_CAPABILITIES.md](./SPEC_CAPABILITIES.md) — what CE delivers for the course  
4. [ACTION_PLAN_COURSE_DELIVERY.md](./ACTION_PLAN_COURSE_DELIVERY.md) — phased delivery  
5. [DEPLOY_AND_STUDENT_TENANCY.md](./DEPLOY_AND_STUDENT_TENANCY.md) — portal BFF `user=`  
6. [memory/DECISIONS.md](./memory/DECISIONS.md) — append-only decisions  
7. [SCREENSHOT_PROTOCOL.md](./SCREENSHOT_PROTOCOL.md) — Vibium + Chrome  

Index: [README.md](./README.md). Root showcase front door: [../README.md](../README.md).

---

## Work completed (session lineage)

- Compose lab: scripts + lean overlays + port **3847** / **3848**
- Docs: architecture, capabilities, curriculum refactor n8n→Dify, tenancy, action plan, decisions
- Sample Chatflow + OpenRouter light model path
- Vibium + Chrome screenshot protocol + curated proof/worksheet PNGs
- Publish-ready README / `.gitignore` hardened for secrets and bulk screenshots
- 2026-10-03: walkthrough password gate + BYO OpenRouter key + optional tunneled Studio canvas (demo-only)

---

## Unfinished / next steps

From [ACTION_PLAN_COURSE_DELIVERY.md](./ACTION_PLAN_COURSE_DELIVERY.md) (verify live status there):

| Priority | Item |
|----------|------|
| P0 | App API key for sample → portal secrets pattern (not git) |
| P0 | `lab/prod.env.template` for custom domain |
| P1 | Portal BFF `POST … → /v1/chat-messages` with `user=student:{id}` |
| P2 | Module 2–5 templates + DSL export under `templates/` |
| P2 | Mock claims API for agent/HTTP labs |
| P3 | Instructor runbooks + student worksheets pack |

**GitHub + Origin:** you can have both. Official live sync is **GitHub → Origin inbound mirror** (GitHub stays source of truth). The existing Origin repo `manutej/dify-labs` is **Origin-hosted** (`mirrorStatus: no-mirror`) and cannot be flipped to a GitHub mirror in place. This agent **did not** create a GitHub repo. Unblock: `gh repo create` on your machine, then either Sync from GitHub in the Origin UI or dual remotes + `./scripts/sync-github.sh`. Details: [PUBLIC_REPO.md](./PUBLIC_REPO.md).

---

## Suggested resume focuses (pick one)

1. **Portal BFF wiring** — implement Service API proxy + tenancy proof (two students, separate histories).  
2. **Module template factory** — build/export Modules 2–5 DSL + mock claims API.  
3. **Publish to GitHub** — you must create the GitHub repo (`gh` / GitHub UI); then Path A (Sync from GitHub) or Path B (`git remote add github` + `./scripts/sync-github.sh`). See [PUBLIC_REPO.md](./PUBLIC_REPO.md).  
4. **Screenshot pack expansion** — extend shot list and regenerate curated PNGs.

```text
/ce-handoff resume docs/HANDOFF.md
```
