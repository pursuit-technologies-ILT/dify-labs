# Verify repo identity and publish to GitHub (org handoff)

Use this runbook **before** cloning, forking, or pushing to your organization (for example **Pursuit Path ILT**). It confirms you have the **Dify enterprise training lab** repo—not a stale fork or wrong Cursor worktree—and explains how to publish without expecting GitHub “symlinks” between repos.

**Related:** [docs/PUBLIC_REPO.md](../PUBLIC_REPO.md) (Origin ↔ GitHub modes) · [HANDOFFs.md](../../HANDOFFs.md) (colleague index) · [scripts/sync-github.sh](../../scripts/sync-github.sh)

---

## 1. Quick verify (copy-paste)

Run from the folder you believe is the lab repo (on macOS, often `dify-labs`):

```bash
cd /path/to/your/clone

git remote -v
git fetch --all --prune
git status -sb
git log -1 --oneline
git rev-parse HEAD
test -f HANDOFFs.md && test -f AGENTS.md && test -f docs/PUBLIC_REPO.md && echo "OK: handoff files present"
head -5 README.md
```

### What “right repo” looks like

| Check | Expected |
|-------|----------|
| **README title** | First line: `# Enterprise AI Training Lab (Dify)` |
| **HANDOFFs.md** | Exists at repo root; describes Dify CE **1.17.1**, n8n replacement, lab factory programme |
| **AGENTS.md** | Exists; pins Dify **1.17.1**, ports **3847** / **3848**, `localhost` cookie rule |
| **Commit tip** | At least **`f53715f`** (`fix(macos): skip sudo dockerd path when using Docker Desktop`) or **newer** on `main` |
| **Branch** | `main` in sync with your primary remote after `git fetch` (no surprise “behind” unless you just pulled) |

If any row fails, stop and reconcile with the person who sent the clone URL before pushing to an org.

### Canonical identities (two remotes you may see)

| Role | Typical URL / name |
|------|---------------------|
| **Named Origin repo** (private, long-lived) | Web: `https://cursor.com/codebase/manutej/dify-labs` · Git: `https://origin.cursor.com/manutej/dify-labs.git` |
| **Cloud agent worktree** (temporary) | Git remote may look like `https://origin.cursor.com/git/manutej/tmp-*.git` — same **commit history** on `main`, not a different product |
| **Your org GitHub** (you create) | Example: `https://github.com/Pursuit-Path-ILT/dify-labs.git` — **replace org slug** with your real GitHub organization name |

On a colleague Mac, `origin` should usually point at **either** the named `manutej/dify-labs` Origin URL **or** a GitHub remote you added after first push—not an old unrelated repo.

---

## 2. Update before handoff

```bash
git checkout main
git pull origin main    # or: git pull github main — whichever is your source of truth
git log -1 --oneline    # confirm >= f53715f
```

If you use **dual remotes** (Origin + GitHub), see [docs/PUBLIC_REPO.md](../PUBLIC_REPO.md) Path B and:

```bash
./scripts/sync-github.sh main
```

---

## 3. Publish to **your** GitHub organization

Replace placeholders:

- **`YOUR_ORG`** — your GitHub organization login (example only: `Pursuit-Path-ILT`)
- **`dify-labs`** — repo name (keep unless your org naming policy differs)

You need **org permission** to create repos (or an empty repo created by an org admin) and **`gh auth login`** or HTTPS/SSH credentials with `repo` scope.

### Path A — GitHub CLI (`gh repo create` under the org)

```bash
gh auth login   # github.com; account must have access to YOUR_ORG

gh repo create YOUR_ORG/dify-labs \
  --private \
  --description "Self-hosted Dify CE lab for no-code agentic AI training (n8n replacement), OpenRouter keys-only, portal BFF tenancy docs." \
  --source=. \
  --remote=github \
  --push
```

Use `--public` instead of `--private` if the org wants a public showcase.

If the repo already exists empty:

```bash
git remote add github https://github.com/YOUR_ORG/dify-labs.git
git push -u github main
```

### Path B — GitHub UI, then push

1. Org → **New repository** → name `dify-labs` → create **empty** (no README/license if you are pushing existing history).
2. Locally:

   ```bash
   git remote add github https://github.com/YOUR_ORG/dify-labs.git
   # or SSH: git@github.com:YOUR_ORG/dify-labs.git
   git push -u github main
   ```

3. Optional: keep Origin as `origin`, GitHub as `github`:

   ```text
   origin    https://origin.cursor.com/manutej/dify-labs.git
   github    https://github.com/YOUR_ORG/dify-labs.git
   ```

   Routine sync to org GitHub after Origin work:

   ```bash
   ./scripts/sync-github.sh
   ```

### Path C — Transfer ownership (only if **you** own the source repo)

If the lab already lives under a **personal** or **other org** GitHub repo you administer:

1. GitHub → source repo → **Settings** → **Danger zone** → **Transfer ownership** → target **`YOUR_ORG/dify-labs`**.
2. All collaborators must accept org policies; update local remotes if the URL changes.

This does **not** apply to Cursor Origin-only hosting until a GitHub repo exists—create or push first (Path A/B).

---

## 4. Symlinks, forks, and “one copy” — what GitHub allows

| Idea | Reality |
|------|---------|
| **Symlink one repo to another on GitHub** | **Not supported.** GitHub has no feature to alias or symlink repository A to B. Each repo is its own object database and URL. |
| **“Same files in two places”** | Use **one source of truth** + explicit sync: `git push` to a second remote, or `./scripts/sync-github.sh`, or an inbound **Sync from GitHub** mirror in Cursor (see [docs/PUBLIC_REPO.md](../PUBLIC_REPO.md)). |
| **Fork** | Creates a **linked copy** on GitHub (good for contributing upstream). For org handoff of the **canonical** lab, prefer **org-owned repo + push** (Path A/B) or **transfer** (Path C), not an personal fork left as SoT. |
| **Mirror (git `--mirror`)** | Full mirror push is for backup/CI; day-to-day teaching handoff is normal **`git push github main`**. |

**Practical recommendation for Pursuit Path ILT–style handoff:** org repo `YOUR_ORG/dify-labs` holds the cohort copy; operators with Origin access keep using `origin` if needed; run `./scripts/sync-github.sh` when you want GitHub updated—do not expect automatic two-way sync unless you configure Cursor **Sync from GitHub** (Path A in PUBLIC_REPO.md).

---

## 5. Safe contents (never push secrets)

**Include:** `README.md`, `HANDOFFs.md`, `AGENTS.md`, `docs/`, `scripts/`, `lab/` overlays, `vendor/dify/docker` + `vendor/DIFY_VERSION`, `.env.example`, `.gitignore`.

**Exclude (gitignored):** `.env`, `lab-creds.env`, `vendor/dify/docker/.env`, `volumes/`, bulk local screenshots under `artifacts/screenshots/`.

---

## 6. Reference: cloud agent workspace snapshot (2026-10-07)

Used to document what a verified tip looked like when this runbook was written:

| Item | Value |
|------|--------|
| Tip SHA | `f53715f68b1e053b5984502d68a3f4cdbf484856` |
| Tip subject | `fix(macos): skip sudo dockerd path when using Docker Desktop` |
| This VM `origin` | `https://origin.cursor.com/git/manutej/tmp-4c42d2c9dfc4c969.git` (temp worktree; same programme as `manutej/dify-labs`) |
| Named Origin (canonical name) | `https://origin.cursor.com/manutej/dify-labs.git` |

Your colleague clone should match **files + commit**, not necessarily the `tmp-*` remote URL.
