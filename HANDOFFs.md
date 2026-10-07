# HANDOFFs — colleague index

**Audience:** instructors, portal engineers, compound-build integrators, and agents picking up this repo.  
**Detailed continuity doc:** [docs/HANDOFF.md](docs/HANDOFF.md) · **Agent brief:** [llms.txt](llms.txt) · **Project memory:** [AGENTS.md](AGENTS.md)

---

## What this repo is

An **enterprise training lab** that replaces **n8n** with **self-hosted Dify CE 1.17.1** (+ optional Open WebUI) for the 2-day course *No-Code Agentic AI: Building Business Automation* (synthetic health-insurance scenarios).

| Layer | Role |
|-------|------|
| Builders | Dify Studio (Chatflow / Workflow canvas) |
| Students | Existing portal → BFF → Dify Service API (`user=<portal_student_id>`) — no Studio login |
| Models (lab) | OpenRouter via operator keys in `.env` / portal secrets |
| Orchestration | Long-horizon **compound build** programme (lab factory, runbooks, DSL exports, portal wire) |

**Non-negotiables:** n8n is out; pinned Dify **1.17.1**; use **`localhost`** (not `127.0.0.1`) for Studio cookies; never commit secrets.

---

## Programme status (lab factory)

Tracker: [docs/operations/LAB-FACTORY-CHECKLIST.md](docs/operations/LAB-FACTORY-CHECKLIST.md)  
Process: [docs/operations/COMPOUND-BUILD-SOP.md](docs/operations/COMPOUND-BUILD-SOP.md)  
Catalog: [templates/lab-catalog.yaml](templates/lab-catalog.yaml) (30 labs + capstone blueprints)

| Slice | Status |
|-------|--------|
| **S0** — Lab framework, catalog, mock claims, craft docs | **done (eval SHIP)** |
| **S1** — Runbooks for M1–M3 core catalog labs | **done (eval SHIP)** |
| **S2** — Studio DSL exports M2–M4 core | pending |
| **S3** — Portal wire contract from `./scripts/lab-wire.sh` | pending |
| **S4** — Stretch tier in `cohort-advanced.instance.yaml` | pending |
| **S5** — Bundle documentation sync | pending |
| **Integration PR** | **hold** until S0–S5 eval SHIP + `./scripts/programme-gate.sh` green |

Implementers do **not** self-SHIP; independent eval marks rows done. One integrator runs `OPENROUTER_LIVE=1` live OpenRouter per slice when required.

---

## Run locally

```bash
cp .env.example .env
# OPENROUTER_API_KEY=sk-or-...  (never commit .env)

# macOS: start Docker Desktop first; ./scripts/up.sh is enough (no sudo path)
./scripts/up.sh              # LAB_MODE=dify by default
./scripts/status.sh
```

**macOS:** sudo prompts are your **Mac administrator password**, not `COLLAB_PASSWORD`. See [docs/runbooks/TROUBLESHOOTING-MACOS.md](docs/runbooks/TROUBLESHOOTING-MACOS.md). Linux sandboxes only: `./scripts/ensure-docker.sh`.

| Port | Service |
|------|---------|
| **3847** | Dify (Studio + API) — open http://localhost:3847/install |
| **3848** | Open WebUI (`LAB_MODE=full` only) |
| **3860** | Mock claims API (lab-light tests / agent HTTP labs) |

Use **`localhost`** in the browser so auth cookies match the API host.

Other ops: `./scripts/down.sh`, `./scripts/bootstrap.sh`, `./scripts/programme-gate.sh` (pre–eval / pre–PR gate stack).

---

## Walkthrough web & collaborator demo

| Item | Detail |
|------|--------|
| Public demo | [https://dify-labs-walkthrough.vercel.app](https://dify-labs-walkthrough.vercel.app) |
| Local dev | `cd web && cp .env.example .env.local` → set `COLLAB_PASSWORD` locally; `npm install && npm run dev -- --port 3849` |
| Caveats | Demo-only — **not** the production portal-BFF student path. Shared password gate + BYO OpenRouter key in browser (`sessionStorage`). Live canvas needs a public HTTPS tunnel to nginx **:3847**, Dify public URL env, and `./scripts/collab-sso.sh` on **:3850**. |
| Integration doc | [docs/WEBSITE_INTEGRATION.md](docs/WEBSITE_INTEGRATION.md) |
| **Teardown ~2026-10-06** | Remove Vercel env (`COLLAB_PASSWORD`, tunnel-related vars), stop Cloudflare tunnel and SSO helper, `./scripts/apply-dify-public-url.sh --localhost`, rotate Studio admin password. See [docs/HANDOFF.md](docs/HANDOFF.md) § collaborator demo. |

---

## Verify before handoff

Before you push to an org (for example **Pursuit Path ILT**) or send a colleague a clone URL, confirm repo identity and `main` tip:

**Runbook:** [docs/runbooks/VERIFY-REPO-AND-GITHUB.md](docs/runbooks/VERIFY-REPO-AND-GITHUB.md)

Minimum checks: `git remote -v`, `git fetch`, `git status`, `git log -1` → expect README `# Enterprise AI Training Lab (Dify)`, root **`HANDOFFs.md`**, commit **≥ `f53715f`**. GitHub has **no symlink between repos**—use one source of truth and `./scripts/sync-github.sh` or a second `github` remote (see below).

---

## GitHub sharing (Origin + public showcase)

**Canonical detail:** [docs/PUBLIC_REPO.md](docs/PUBLIC_REPO.md)

| Host | Today |
|------|--------|
| **Origin** (private, source of truth for this cloud worktree) | `https://cursor.com/codebase/manutej/dify-labs` · clone `https://origin.cursor.com/manutej/dify-labs.git` · `mirrorStatus: no-mirror` |
| **GitHub** `manutej/dify-labs` | **Not created yet** — create on your machine (this agent had **no `gh` login** / no `GITHUB_TOKEN`) |

### Recommended while Origin-hosted: Path B (dual remotes)

1. Authenticate GitHub CLI (or use HTTPS/SSH with a PAT):

   ```bash
   gh auth login
   ```

2. Create the public repo and push `main` (preferred name `dify-labs`; fallback `dify-training-lab` if taken):

   ```bash
   gh repo create manutej/dify-labs \
     --public \
     --description "Self-hosted Dify lab for no-code agentic AI training (n8n replacement), OpenRouter keys-only, screenshot protocol for lab materials." \
     --source=. \
     --remote=github \
     --push
   ```

   **Or** create an empty repo in the GitHub UI, then:

   ```bash
   git remote add github https://github.com/manutej/dify-labs.git
   git push -u github main
   ```

3. Keep **Origin** as `origin`; add **GitHub** as `github`:

   ```text
   origin    https://origin.cursor.com/manutej/dify-labs.git
   github    https://github.com/manutej/dify-labs.git
   ```

4. After each Origin push you want public:

   ```bash
   ./scripts/sync-github.sh
   # or: git push origin main && git push github main
   ```

### Path A — official inbound mirror (GitHub = source of truth)

If you want Cursor agents to open **GitHub PRs** with live Origin sync: create GitHub repo → push `main` → Cursor codebase **Sync from GitHub**. That creates a **new** mirrored Origin copy; the existing Origin-only `manutej/dify-labs` does not flip to inbound in place. See [docs/PUBLIC_REPO.md](docs/PUBLIC_REPO.md).

### Safe to push

Include docs, scripts, `lab/` overlays, `tools/vibium/` (not `node_modules`), `vendor/dify/docker` + `vendor/DIFY_VERSION`, `.env.example`. **Exclude** (gitignored): `.env`, `lab-creds.env`, `vendor/dify/docker/.env`, `volumes/`, bulk `artifacts/screenshots/`.

---

## Where to read next

| Doc | Purpose |
|-----|---------|
| [docs/HANDOFF.md](docs/HANDOFF.md) | Full handoff: architecture, credentials, screenshots, next steps |
| [llms.txt](llms.txt) | Dense agent brief |
| [docs/README.md](docs/README.md) | Docs hierarchy |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | Topology and scale |
| [docs/PUBLIC_REPO.md](docs/PUBLIC_REPO.md) | GitHub ↔ Origin modes |
