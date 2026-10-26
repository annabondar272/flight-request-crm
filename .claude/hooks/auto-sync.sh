#!/usr/bin/env bash
# Stop hook: commit every change in the repo and push it to GitHub.
# Does nothing when the working tree is clean.
cd "${CLAUDE_PROJECT_DIR:-$(dirname "$0")/../..}" || exit 0

[ -z "$(git status --porcelain)" ] && exit 0

git add -A
files=$(git diff --cached --name-only | head -10 | tr '\n' ' ')
git commit -q -m "Auto-sync: $(date '+%Y-%m-%d %H:%M')" -m "Changed: $files" || exit 0

if git push -q origin HEAD 2>/dev/null; then
  echo '{"systemMessage": "Auto-sync: changes committed and pushed to GitHub."}'
else
  echo '{"systemMessage": "Auto-sync: committed locally, but the push to GitHub failed."}'
fi
