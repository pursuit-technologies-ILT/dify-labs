#!/usr/bin/env bash
# Push the current branch to Origin (`origin`) and, if configured, to GitHub (`github`).
# Does not create the GitHub repo. See docs/PUBLIC_REPO.md.
set -euo pipefail

REMOTE_ORIGIN="${REMOTE_ORIGIN:-origin}"
REMOTE_GITHUB="${REMOTE_GITHUB:-github}"
BRANCH="${1:-$(git rev-parse --abbrev-ref HEAD)}"

if [[ -z "$BRANCH" || "$BRANCH" == "HEAD" ]]; then
  echo "error: detached HEAD — pass a branch name: $0 main" >&2
  exit 1
fi

echo "=== git push ${REMOTE_ORIGIN} ${BRANCH} (Origin) ==="
git push "$REMOTE_ORIGIN" "$BRANCH"

if git remote get-url "$REMOTE_GITHUB" >/dev/null 2>&1; then
  echo "=== git push ${REMOTE_GITHUB} ${BRANCH} (GitHub) ==="
  git push "$REMOTE_GITHUB" "$BRANCH"
else
  echo "note: no remote named '${REMOTE_GITHUB}' — skipped GitHub."
  echo "      Create the public repo, then:"
  echo "      git remote add ${REMOTE_GITHUB} https://github.com/manutej/dify-labs.git"
  echo "      git push -u ${REMOTE_GITHUB} ${BRANCH}"
  echo "      Docs: docs/PUBLIC_REPO.md"
fi
