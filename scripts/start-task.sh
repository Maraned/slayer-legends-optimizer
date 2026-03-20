#!/usr/bin/env bash
set -uo pipefail

REPO="Maraned/slayer-legends-optimizer"
ISSUE_NUM="${1:?Usage: start-task <issue-number>}"

ISSUE_JSON=$(gh issue view "$ISSUE_NUM" --repo "$REPO" --json number,title,body)
ISSUE_TITLE=$(echo "$ISSUE_JSON" | python3 -c "import sys,json; print(json.load(sys.stdin)['title'])")
ISSUE_BODY=$(echo "$ISSUE_JSON" | python3 -c "import sys,json; print(json.load(sys.stdin)['body'] or '')")

SLUG=$(echo "$ISSUE_TITLE" | tr '[:upper:]' '[:lower:]' | sed 's/[^a-z0-9]/-/g' | sed 's/-\+/-/g' | sed 's/^-\|-$//g' | cut -c1-40)
SESSION_NAME="gh-${ISSUE_NUM}-${SLUG}"

gh issue edit "$ISSUE_NUM" --repo "$REPO" --add-label "in-progress" 2>/dev/null || true

PROMPT="You are implementing GitHub Issue #${ISSUE_NUM}: ${ISSUE_TITLE}

## Issue Description
${ISSUE_BODY}

## Instructions
- Branch name: ${SESSION_NAME} (Claude will create this worktree automatically)
- Stack: Next.js 16, React 19, TypeScript, Tailwind CSS 4
- When done: gh pr create --repo ${REPO} --title \"${ISSUE_TITLE}\" --body \"Closes #${ISSUE_NUM}\"
- Explore the codebase first, ask questions if anything is unclear"

echo "Starting interactive Claude session for issue #${ISSUE_NUM}: ${ISSUE_TITLE}"
claude --worktree "$SESSION_NAME" --name "$SESSION_NAME" "$PROMPT"
