# Public showcase repository

Target: **public** GitHub repo under the authenticated owner **`manutej`**  
Suggested name: **`dify-training-lab`**  
Canonical URL once created: https://github.com/manutej/dify-training-lab

> Note: `manutej` on GitHub is a **user** account (not a GitHub Organization). Public repos live at `github.com/manutej/<name>`. Origin namespace is also `manutej`.

## Why this agent could not create it

Attempted from the cloud-agent environment (2026-10-02):

| Path | Result |
|------|--------|
| `gh` CLI | Installed but **not logged in** (`gh auth status` → no hosts) |
| GitHub SSH | `Permission denied (publickey)` |
| `origin repo create manutej/dify-training-lab` | **Token not scoped** for create under `manutej` (scoped to temp remote only) |
| Origin visibility | Only `private` / `internal` — **no `public`** choice on Origin |
| Current remote | `origin.cursor.com/git/manutej/tmp-4c42d2c9dfc4c969.git` (private temporary Cursor/Origin repo) |
| GitHub App mirror | Current Origin repo has `mirrorStatus: no-mirror`; no GitHub installation linked on this token |

So: handoff + code can ship on the **current Origin remote**; a **public GitHub** URL needs one action from you (or a scoped `GITHUB_TOKEN`).

## Fastest path (your machine or Cursor Create-repo)

### A) Cursor UI — Create repository pill

In the New Project / cloud-agent conversation that owns this worktree:

1. Use **Create repository** (or equivalent publish/create-repo control) for GitHub.
2. Owner: **`manutej`** · Name: **`dify-training-lab`** · Visibility: **Public**.
3. Description: `Self-hosted Dify lab for no-code agentic AI training (n8n replacement), OpenRouter keys-only, screenshot protocol for lab materials.`
4. Push existing `main` (do not re-init empty if the UI offers “push existing”).

### B) GitHub CLI (authenticated as manutej)

```bash
# from a clone of this repo with clean working tree
gh auth login   # if needed — github.com, HTTPS or SSH

gh repo create manutej/dify-training-lab \
  --public \
  --description "Self-hosted Dify lab for no-code agentic AI training (n8n replacement), OpenRouter keys-only, screenshot protocol for lab materials." \
  --source=. \
  --remote=github \
  --push
```

If the repo already exists empty on GitHub:

```bash
git remote add github https://github.com/manutej/dify-training-lab.git
git push -u github main
```

### C) Unblock the agent later

Provide a fine-scoped **`GITHUB_TOKEN`** (or re-auth `gh`) with `repo` scope on `manutej`, then ask the agent to create + push `dify-training-lab` public.

## What to push (safe tree)

Include: `README.md`, `AGENTS.md`, `docs/` (including handoff + curated screenshots), `scripts/`, `lab/` overlays, `tools/vibium/` (sources + lockfile, not `node_modules`), `vendor/dify/docker` compose tree + `vendor/DIFY_VERSION`, `.env.example`, `.gitignore`.

Exclude (already gitignored): `.env`, `lab-creds.env`, `vendor/dify/docker/.env`, `volumes/`, `artifacts/screenshots/`, `tools/vibium/node_modules/`.

Rotate placeholders in `lab/dify.env.overlay` before any shared deployment; they are lab defaults, not production secrets.

## Paste blurb (after the public URL exists)

> **Dify Training Lab** — self-hosted Dify CE 1.17.1 for enterprise no-code agentic AI training (n8n replacement). OpenRouter keys stay with the operator; students use the existing portal (BFF → Dify Service API). Includes Compose ops scripts, architecture/tenancy docs, and a Vibium+Chrome screenshot protocol for lab materials.  
> Repo: https://github.com/manutej/dify-training-lab
