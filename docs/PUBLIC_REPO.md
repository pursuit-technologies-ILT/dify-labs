# Public GitHub + Origin (can they both exist?)

**Short answer:** Yes. You can keep Origin **and** have a GitHub repo. This cloud agent **could not create GitHub** (verified 2026-10-03). You create GitHub on your machine or in the GitHub UI, then either use Cursor’s **inbound GitHub mirror** (automatic, GitHub is source of truth) or **dual remotes** (manual Origin→GitHub push).

| Host | Status (verified) | URL |
|------|-------------------|-----|
| Origin (private, source of truth today) | Exists · `mirrorStatus: **no-mirror**` · `githubInstallationId: **null**` | https://cursor.com/codebase/manutej/dify-labs · `https://origin.cursor.com/manutej/dify-labs.git` |
| GitHub `manutej/dify-labs` | **Not created as a public repo** (not in manutej’s 97 public repos; unauthenticated lookup is 404) | Desired: https://github.com/manutej/dify-labs |
| GitHub `manutej/dify-training-lab` | Same: **not** among public repos | Fallback name if `dify-labs` is taken as a **private** GitHub repo |

Origin personal repos stay **private** or **internal** (`origin repo edit --visibility` has no `public`). Showcase visibility is GitHub’s job.

---

## How official Origin ↔ GitHub sync actually works

Docs: [Mirror a GitHub repository](https://cursor.com/docs/origin/mirror-github), [Clone, Push & Pull](https://cursor.com/docs/origin/git), [Create a repository](https://cursor.com/docs/origin/create-repository).

| Mode | Source of truth | What happens |
|------|-----------------|--------------|
| **Origin-hosted** (this repo today) | Origin | Pushes land on Origin. GitHub is **not** in the path. `mirrorStatus: no-mirror`. |
| **Inbound mirror** (official live sync) | **GitHub** | Connect the Cursor GitHub app → **Sync from GitHub**. Origin is a live copy. `git push` to the Origin clone URL is forwarded to GitHub; Origin updates after GitHub accepts. |
| **Outbound** (Origin → GitHub as SoT) | Origin (legacy) | CLI still has `origin repo mirror transition --to outbound`, but that only starts from **inbound**. From `no-mirror` the CLI refuses. Origin’s public API changelog **removed outbound** as a new/supported transition; do not plan on Origin-hosted → automatic GitHub. |
| **Detach** | Origin | Settings → General → **Detach from GitHub** (or `origin repo mirror detach`). Stops sync; GitHub repo is left as-is. |

CLI (your machine after `origin auth login`):

```bash
origin repo view manutej/dify-labs --json org,name,mirrorStatus,githubInstallationId,githubNodeId,cloneUrl
origin repo mirror status -R manutej/dify-labs
# Mint a *new* Origin copy of an *existing* GitHub repo (needs GitHub app + admin):
origin repo create-mirrored manutej/dify-labs
```

There is **no** `origin github` connect command. GitHub App linking is the Cursor/Origin **web UI**.

**You cannot convert the existing Origin-only `manutej/dify-labs` into an inbound GitHub mirror in place.** Inbound starts from GitHub (`create-mirrored` / Sync from GitHub), not from `no-mirror`. Live two-way/auto sync for *this* Origin UUID would require a different hosting mode than it has today.

---

## Path A — Official automatic sync (GitHub source of truth)

Use this if you want Cursor agents on a mirrored repo to open **GitHub** PRs and Origin to stay current without a second `git push`.

1. **Connect GitHub to Cursor** (once): GitHub integration / Cursor GitHub App on the **personal account** `manutej` (this is a user, not a GitHub Organization). You need **admin** on the repo you sync.
2. **Create the GitHub repo** (empty is fine) — see commands below. Prefer **public** for showcase. Preferred name: `dify-labs`.
3. **Push `main`** from a clone that already has this history (or after adding the `github` remote).
4. Open [cursor.com/codebase](https://cursor.com/codebase) → **Sync from GitHub** → pick `manutej/dify-labs` (or `dify-training-lab`) → confirm.
5. Confirm under Origin repo **Settings → General**: Origin = mirror, GitHub = source.

Caveat: that Origin copy is a **new** mirrored repo. Keep using it for agents that should talk to GitHub. The current private Origin-hosted `manutej/dify-labs` stays Origin-only unless you stop using it.

Ongoing: push once (`git push origin main` on the **mirrored** clone URL). Do not expect Origin-hosted `dify-labs` and the new mirror to merge themselves.

---

## Path B — Keep Origin as source of truth + manual GitHub showcase (recommended while Origin-hosted)

1. Create public GitHub `manutej/dify-labs` (or `dify-training-lab`).
2. Add a second remote named `github`.
3. After every Origin push you want public: `git push github main` or `./scripts/sync-github.sh`.

True automatic two-way sync is **not** something this agent can turn on with tokens. Dual remotes are honest Origin→GitHub (and GitHub→Origin only if you `git pull` both and merge yourself).

### Create + first push (your machine, authenticated as manutej)

```bash
gh auth login   # github.com, HTTPS or SSH

# Preferred name (public showcase). Use --private if you are not ready to show it.
gh repo create manutej/dify-labs \
  --public \
  --description "Self-hosted Dify lab for no-code agentic AI training (n8n replacement), OpenRouter keys-only, screenshot protocol for lab materials." \
  --source=. \
  --remote=github \
  --push
```

If `dify-labs` is taken:

```bash
gh repo create manutej/dify-training-lab \
  --public \
  --description "Self-hosted Dify lab for no-code agentic AI training (n8n replacement), OpenRouter keys-only, screenshot protocol for lab materials." \
  --source=. \
  --remote=github \
  --push
```

If you created an empty repo in the GitHub UI:

```bash
git remote add github https://github.com/manutej/dify-labs.git
# or: git remote add github https://github.com/manutej/dify-training-lab.git
git push -u github main
```

Keep Origin as `origin` (do not rename it to GitHub):

```text
origin    https://origin.cursor.com/manutej/dify-labs.git
github    https://github.com/manutej/dify-labs.git
```

Routine:

```bash
git push origin main && git push github main
# or
./scripts/sync-github.sh
```

Optional dual-push URLs (Cursor git docs). This only works if **both** credentials work for that remote; in practice two remotes are clearer:

```bash
git remote set-url --add --push origin https://github.com/manutej/dify-labs.git
git remote set-url --add --push origin https://origin.cursor.com/manutej/dify-labs.git
```

---

## Why this agent still cannot create GitHub (2026-10-03)

| Path | Result |
|------|--------|
| `gh repo create` | `gh` not logged in; no `GH_TOKEN` |
| GitHub API + `CURSOR_AUTH_TOKEN` | 401 |
| `origin repo create` / `origin repo create-mirrored` | Token **not scoped** for create under `manutej` (scoped to this cloud worktree’s temp remote) |
| Origin visibility | Only `private` \| `internal` |
| `origin repo mirror transition --to inbound\|outbound -R manutej/dify-labs` | Refused: current status is `no-mirror` |
| Git `ls-remote` `origin.cursor.com/manutej/dify-labs.git` from this worktree | 403 without this environment’s Origin credential helper for that host |
| This worktree’s `origin` remote | `origin.cursor.com/git/manutej/tmp-*` (private temp), **not** the named `dify-labs` clone URL |

Unblock the agent later with a `GITHUB_TOKEN` (`repo` scope on `manutej`) **or** run the `gh repo create` commands yourself.

---

## What to push (safe tree)

Include: `README.md`, `AGENTS.md`, `docs/`, `scripts/` (including `sync-github.sh`), `lab/` overlays, `tools/vibium/` (sources + lockfile, not `node_modules`), `vendor/dify/docker` compose tree + `vendor/DIFY_VERSION`, `.env.example`, `.gitignore`.

Exclude (gitignored): `.env`, `lab-creds.env`, `vendor/dify/docker/.env`, `volumes/`, `artifacts/screenshots/`, `tools/vibium/node_modules/`.

Rotate placeholders in `lab/dify.env.overlay` before any shared deployment.

---

## Paste blurb (only after you verify the GitHub URL in a browser)

> **Dify Training Lab** — self-hosted Dify CE 1.17.1 for enterprise no-code agentic AI training (n8n replacement). OpenRouter keys stay with the operator; students use the existing portal (BFF → Dify Service API). Includes Compose ops scripts, architecture/tenancy docs, and a Vibium+Chrome screenshot protocol for lab materials.  
> Origin (private): https://cursor.com/codebase/manutej/dify-labs  
> GitHub (public, after you create it): https://github.com/manutej/dify-labs
