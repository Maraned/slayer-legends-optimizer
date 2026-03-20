#!/usr/bin/env bash
set -uo pipefail

CLAUDE="${CLAUDE:-/home/marcus/.nvm/versions/node/v24.10.0/bin/claude}"
REPO="Maraned/slayer-legends-optimizer"
REPO_NAME="slayer-legends-optimizer"
REPO_OWNER="Maraned"
LOG_DIR="/tmp/claude-issues"
POLL_INTERVAL="${POLL_INTERVAL:-30}"
PROJECT_NUMBER="${PROJECT_NUMBER:-1}"  # Set to your GitHub Project number (e.g. PROJECT_NUMBER=3)
GLOBAL_PAUSE_FILE="${LOG_DIR}/global_pause_until"
ONE_MODE=false
for arg in "$@"; do [[ "$arg" == "--one" ]] && ONE_MODE=true; done

mkdir -p "$LOG_DIR"

log()  { echo "[$(date '+%H:%M:%S')] $*"; }
err()  { echo "[$(date '+%H:%M:%S')] ERROR: $*" >&2; }
try()  {
  # try <description> <command...>
  local desc="$1"; shift
  if ! "$@" 2>/tmp/claude-issues/last_error.txt; then
    err "${desc} failed: $(cat /tmp/claude-issues/last_error.txt)"
    return 1
  fi
}

# ── Dependency checking ─────────────────────────────────────────────────────
check_dependencies_met() {
  local body="$1"
  local dep_nums
  dep_nums=$(echo "$body" | grep -oiE '(depends on|blocked by|requires) #[0-9]+' \
    | grep -oE '#[0-9]+' | tr -d '#') || true

  if [ -z "$dep_nums" ]; then
    return 0
  fi

  for dep in $dep_nums; do
    local state
    state=$(gh issue view "$dep" --repo "$REPO" --json state --jq '.state' 2>/dev/null) || state="UNKNOWN"
    if [ "$state" != "CLOSED" ]; then
      log "Issue #${dep} (dependency) is still ${state} — skipping"
      return 1
    fi
  done
  return 0
}

# ── Agent spawning ──────────────────────────────────────────────────────────
spawn_worker() {
  local issue_num="$1" issue_title="$2" issue_body="$3" issue_labels="${4:-}"
  local slug session_name log_file script_file

  session_name="gh-${issue_num}"
  log_file="${LOG_DIR}/${session_name}.log"
  script_file="${LOG_DIR}/${session_name}.sh"

  local is_conflict=false
  echo "$issue_labels" | grep -q '"conflict"' && is_conflict=true

  log "Spawning agent for issue #${issue_num}: ${issue_title}${is_conflict:+ (conflict resolution)}"

  local prompt
  if $is_conflict; then
    local branch="worktree-gh-${issue_num}"
    prompt="You are resolving a merge conflict for GitHub Issue #${issue_num}: ${issue_title}

## Issue Description
${issue_body}

## Instructions
The branch \`${branch}\` has merge conflicts with the \`main\` branch. Resolve them:
1. git fetch origin main
2. git rebase origin/main
3. Resolve all conflicts (preserve the intent of both sides), then: git add -A && git rebase --continue
4. git push --force-with-lease
5. gh issue edit ${issue_num} --repo ${REPO} --remove-label conflict --remove-label conflict-in-progress --remove-label in-progress --add-label resolved
- Work autonomously. Only ask if truly blocked."
  else
    prompt="You are autonomously implementing GitHub Issue #${issue_num}: ${issue_title}

## Issue Description
${issue_body}

## Instructions
- Stack: Next.js 16, React 19, TypeScript, Tailwind CSS 4
- Work autonomously. Only ask if truly blocked.
- When done: gh pr create --repo ${REPO} --title \"${issue_title}\" --body \"Closes #${issue_num}\"
- Then: gh issue edit ${issue_num} --repo ${REPO} --remove-label in-progress"
  fi

  # Write prompt to file (avoids quoting issues with newlines/quotes in tmux command)
  if ! printf '%s' "$prompt" > "${LOG_DIR}/${session_name}.prompt"; then
    err "Failed to write prompt file for issue #${issue_num}"
    return 1
  fi

  # Write a launcher script for this session
  if ! cat > "$script_file" << SCRIPT
#!/usr/bin/env bash
PROMPT=\$(cat "${LOG_DIR}/${session_name}.prompt")
${CLAUDE} --worktree "${session_name}" \\
       --name "${session_name}" \\
       --permission-mode bypassPermissions \\
       "\$PROMPT" 2>&1 | tee "${log_file}"
SCRIPT
  then
    err "Failed to write launcher script for issue #${issue_num}"
    return 1
  fi
  chmod +x "$script_file"

  # Launch in a named tmux session
  if ! tmux new-session -d -s "$session_name" "$script_file" 2>/tmp/claude-issues/last_error.txt; then
    err "tmux failed for ${session_name}: $(cat /tmp/claude-issues/last_error.txt)"
    return 1
  fi

  log "  tmux session '${session_name}' started — log: ${log_file}"
  # Append only if not already listed
  grep -qxF "$session_name" "${LOG_DIR}/active_sessions.txt" 2>/dev/null || \
    echo "$session_name" >> "${LOG_DIR}/active_sessions.txt"

  if $is_conflict; then
    # Keep conflict label; add conflict-in-progress, mark as in-progress, remove claude trigger
    if ! gh issue edit "$issue_num" --repo "$REPO" \
      --add-label "in-progress" --add-label "conflict-in-progress" --remove-label "claude" 2>/tmp/claude-issues/last_error.txt; then
      err "gh label update failed for #${issue_num}: $(cat /tmp/claude-issues/last_error.txt)"
    fi
  else
    if ! gh issue edit "$issue_num" --repo "$REPO" \
      --add-label "in-progress" --remove-label "claude" 2>/tmp/claude-issues/last_error.txt; then
      err "gh label update failed for #${issue_num}: $(cat /tmp/claude-issues/last_error.txt)"
    fi
  fi
}

# ── Global pause (Claude rate limit affects all agents) ──────────────────────
# Returns 0 (true) if the orchestrator is currently paused, 1 if not.
is_globally_paused() {
  [ -f "$GLOBAL_PAUSE_FILE" ] || return 1
  local until now
  until=$(cat "$GLOBAL_PAUSE_FILE") || return 1
  now=$(date +%s)
  if [ "$now" -ge "$until" ]; then
    rm -f "$GLOBAL_PAUSE_FILE"
    log "Global pause expired — resuming normal operations"
    return 1
  fi
  return 0
}

set_global_pause() {
  local resume_epoch="$1"
  local existing=0
  [ -f "$GLOBAL_PAUSE_FILE" ] && existing=$(cat "$GLOBAL_PAUSE_FILE") || true
  if [ "$resume_epoch" -gt "${existing:-0}" ]; then
    echo "$resume_epoch" > "$GLOBAL_PAUSE_FILE"
    log "Global pause set — all spawning/labeling paused until $(date -d @"$resume_epoch" 2>/dev/null || echo "@${resume_epoch}")"
  fi
}

# ── Token limit detection & resumption ─────────────────────────────────────
check_token_limits() {
  [ -f "${LOG_DIR}/active_sessions.txt" ] || return 0

  while IFS= read -r session; do
    local log_file="${LOG_DIR}/${session}.log"
    [ -f "$log_file" ] || continue
    [ -f "${LOG_DIR}/${session}.resume_at" ] && continue  # Already scheduled — don't reschedule

    # Match: "You've hit your limit · resets 5pm (Europe/Stockholm)"
    #    or: "You've hit your limit · resets 1am (Europe/Stockholm)"
    local reset_time
    reset_time=$(tail -10 "$log_file" \
      | grep -oE "resets [0-9]{1,2}(:[0-9]{2})?(am|pm) \(Europe/Stockholm\)" \
      | tail -1 \
      | grep -oE "[0-9]{1,2}(:[0-9]{2})?(am|pm)") || true

    if [ -n "$reset_time" ]; then
      local resume_epoch
      resume_epoch=$(python3 - "$reset_time" <<'PYEOF'
import sys
from datetime import datetime, timedelta
try:
    from zoneinfo import ZoneInfo
except ImportError:
    from backports.zoneinfo import ZoneInfo

time_str = sys.argv[1].upper()  # e.g. "5PM" or "1AM" or "5:30PM"
tz = ZoneInfo("Europe/Stockholm")
now = datetime.now(tz)
fmt = "%I:%M%p" if ":" in time_str else "%I%p"
t = datetime.strptime(time_str, fmt)
reset = now.replace(hour=t.hour, minute=t.minute, second=0, microsecond=0)
if reset <= now:
    reset += timedelta(days=1)
resume = reset + timedelta(minutes=2)
print(int(resume.timestamp()))
PYEOF
      ) || {
        err "Failed to parse reset time '${reset_time}' for ${session}"
        continue
      }
      echo "$resume_epoch" > "${LOG_DIR}/${session}.resume_at"
      log "Token limit hit for ${session} — resets at ${reset_time} (Europe/Stockholm). Resume scheduled at $(date -d @"$resume_epoch" 2>/dev/null || echo "@${resume_epoch}")"
      set_global_pause "$resume_epoch"
    fi
  done < "${LOG_DIR}/active_sessions.txt"
}

resume_waiting_sessions() {
  [ -f "${LOG_DIR}/active_sessions.txt" ] || return 0
  local now
  now=$(date +%s)

  while IFS= read -r session; do
    local resume_file="${LOG_DIR}/${session}.resume_at"
    [ -f "$resume_file" ] || continue

    local resume_at
    resume_at=$(cat "$resume_file") || continue

    # Check if the log now shows a *different* reset time — if so, reschedule
    local log_file="${LOG_DIR}/${session}.log"
    if [ -f "$log_file" ]; then
      local current_reset_time
      current_reset_time=$(tail -10 "$log_file" \
        | grep -oE "resets [0-9]{1,2}(:[0-9]{2})?(am|pm) \(Europe/Stockholm\)" \
        | tail -1 \
        | grep -oE "[0-9]{1,2}(:[0-9]{2})?(am|pm)") || true

      if [ -n "$current_reset_time" ]; then
        local new_resume_epoch
        new_resume_epoch=$(python3 - "$current_reset_time" <<'PYEOF'
import sys
from datetime import datetime, timedelta
try:
    from zoneinfo import ZoneInfo
except ImportError:
    from backports.zoneinfo import ZoneInfo

time_str = sys.argv[1].upper()
tz = ZoneInfo("Europe/Stockholm")
now = datetime.now(tz)
fmt = "%I:%M%p" if ":" in time_str else "%I%p"
t = datetime.strptime(time_str, fmt)
reset = now.replace(hour=t.hour, minute=t.minute, second=0, microsecond=0)
if reset <= now:
    reset += timedelta(days=1)
resume = reset + timedelta(minutes=2)
print(int(resume.timestamp()))
PYEOF
        ) || true

        if [ -n "$new_resume_epoch" ] && [ "$new_resume_epoch" != "$resume_at" ]; then
          log "Reset time changed for ${session} (now ${current_reset_time} Europe/Stockholm) — rescheduling resume"
          echo "$new_resume_epoch" > "$resume_file"
          resume_at="$new_resume_epoch"
        fi
      fi
    fi

    if [ "$now" -ge "$resume_at" ]; then
      log "Resuming session: ${session} (sending 'continue')"
      # Remove before attempting so a failed send doesn't loop forever
      rm -f "$resume_file"
      if ! tmux send-keys -t "$session" "continue" Enter 2>/tmp/claude-issues/last_error.txt; then
        err "tmux send-keys failed for ${session}: $(cat /tmp/claude-issues/last_error.txt)"
        # Fallback: open a new window that runs claude --continue
        tmux new-window -t "$session" \
          "cd \$(cat ${LOG_DIR}/${session}.worktree 2>/dev/null || echo .) && ${CLAUDE} --continue" \
          2>/tmp/claude-issues/last_error.txt || \
          err "tmux new-window fallback also failed for ${session}: $(cat /tmp/claude-issues/last_error.txt)"
      fi
    fi
  done < "${LOG_DIR}/active_sessions.txt"
}

# ── Startup: restore state of existing sessions ─────────────────────────────
restore_state() {
  log "Checking state of existing sessions..."
  [ -f "${LOG_DIR}/active_sessions.txt" ] || return 0

  # Deduplicate active_sessions.txt in place
  sort -u "${LOG_DIR}/active_sessions.txt" > "${LOG_DIR}/active_sessions.tmp" \
    && mv "${LOG_DIR}/active_sessions.tmp" "${LOG_DIR}/active_sessions.txt"

  local surviving=()
  while IFS= read -r session; do
    [ -z "$session" ] && continue
    if tmux has-session -t "$session" 2>/dev/null; then
      log "  ${session}: tmux session active"
      surviving+=("$session")
    else
      local log_file="${LOG_DIR}/${session}.log"
      if [ -f "$log_file" ] && grep -q 'usage limit\|rate limit\|reset at' "$log_file" 2>/dev/null; then
        log "  ${session}: appears token-limited, will re-check"
        rm -f "${LOG_DIR}/${session}.resume_at"
        surviving+=("$session")
      else
        log "  ${session}: tmux session gone and not token-limited — removing from active list"
      fi
    fi
  done < "${LOG_DIR}/active_sessions.txt"

  # Rewrite active_sessions.txt with only surviving sessions
  printf '%s\n' "${surviving[@]+"${surviving[@]}"}" > "${LOG_DIR}/active_sessions.txt"
}

# ── Conflict resolution ─────────────────────────────────────────────────────
resolve_conflict() {
  local pr_num="$1" branch="$2"
  log "Resolving conflict in PR #${pr_num} (branch: ${branch})"

  # Worktree dir strips the "worktree-" prefix from the branch name
  local dir_name="${branch#worktree-}"
  local worktree_path="/home/marcus/projects/${REPO_NAME}/.claude/worktrees/${dir_name}"

  # Resolve the linked issue number from the PR via the GitHub API
  local issue_num
  issue_num=$(gh pr view "$pr_num" --repo "$REPO" \
    --json closingIssuesReferences \
    --jq '.closingIssuesReferences[0].number' 2>/dev/null) || true

  # Fall back to extracting from branch name if API returns nothing
  if [ -z "$issue_num" ] || [ "$issue_num" = "null" ]; then
    issue_num="${dir_name#gh-}"
    log "Could not resolve linked issue for PR #${pr_num} via API — using branch-derived issue #${issue_num}"
  fi

  if [ ! -d "$worktree_path" ]; then
    log "No worktree found for branch ${branch}, skipping"
    return 0
  fi

  # Skip if a tmux session for this conflict is already running
  local session_name="conflict-${issue_num}"
  if tmux has-session -t "$session_name" 2>/dev/null; then
    log "Conflict resolution already running for issue #${issue_num}, skipping"
    return 0
  fi

  gh issue edit "$issue_num" --repo "$REPO" --add-label "conflict" --add-label "conflict-in-progress" 2>/tmp/claude-issues/last_error.txt || \
    err "Failed to add conflict labels to issue #${issue_num}: $(cat /tmp/claude-issues/last_error.txt)"

  local log_file="${LOG_DIR}/${session_name}.log"
  local script_file="${LOG_DIR}/${session_name}.sh"
  local prompt_file="${LOG_DIR}/${session_name}.prompt"

  printf '%s' "This branch has a merge conflict with main. Fix it:
1. git fetch origin main
2. git rebase origin/main
3. Resolve any conflicts (keep intent of both sides), then: git add -A && git rebase --continue
4. git push --force-with-lease
5. gh issue edit ${issue_num} --repo ${REPO} --remove-label conflict --remove-label conflict-in-progress --remove-label in-progress --add-label resolved
Report what was resolved." > "$prompt_file"

  cat > "$script_file" << SCRIPT
#!/usr/bin/env bash
cd "${worktree_path}"
${CLAUDE} --permission-mode bypassPermissions \
  "\$(cat '${prompt_file}')" 2>&1 | tee "${log_file}"
SCRIPT
  chmod +x "$script_file"

  if ! tmux new-session -d -s "$session_name" "$script_file" 2>/tmp/claude-issues/last_error.txt; then
    err "tmux failed for ${session_name}: $(cat /tmp/claude-issues/last_error.txt)"
    return 1
  fi

  grep -qxF "$session_name" "${LOG_DIR}/active_sessions.txt" 2>/dev/null || \
    echo "$session_name" >> "${LOG_DIR}/active_sessions.txt"

  log "  tmux session '${session_name}' started — log: ${log_file}"
}

# ── Recover stale in-progress issues with no running agent ──────────────────
recover_stale_inprogress() {
  local issues_json
  issues_json=$(gh issue list --repo "$REPO" --label "in-progress" --state open \
    --json number,labels --jq '.[]' 2>/tmp/claude-issues/last_error.txt) || {
    err "Failed to list in-progress issues: $(cat /tmp/claude-issues/last_error.txt)"
    return 1
  }

  while IFS= read -r item; do
    [ -z "$item" ] && continue
    local issue_num
    issue_num=$(echo "$item" | python3 -c "import sys,json; print(json.load(sys.stdin)['number'])" 2>/dev/null) || continue

    # If either a worker or conflict-resolution session is alive, skip
    if tmux has-session -t "gh-${issue_num}" 2>/dev/null || \
       tmux has-session -t "conflict-${issue_num}" 2>/dev/null; then
      continue
    fi

    log "Issue #${issue_num} is in-progress but has no running agent — re-queuing"
    gh issue edit "$issue_num" --repo "$REPO" \
      --remove-label "in-progress" \
      --remove-label "conflict-in-progress" \
      --add-label "claude" \
      2>/tmp/claude-issues/last_error.txt || \
      err "Failed to re-queue issue #${issue_num}: $(cat /tmp/claude-issues/last_error.txt)"
  done < <(echo "$issues_json" | python3 -c "
import sys, json
data = sys.stdin.read().strip()
for line in data.splitlines():
    line = line.strip()
    if line:
        print(line)
" 2>/dev/null)
}

# ── Move issues to Done when their PR is merged ─────────────────────────────
close_done_issues() {
  local merged
  merged=$(gh pr list --repo "$REPO" --state merged \
    --json number,headRefName \
    --jq '.[] | [.number, .headRefName] | @tsv' \
    2>/tmp/claude-issues/last_error.txt) || {
    err "Failed to list merged PRs: $(cat /tmp/claude-issues/last_error.txt)"
    return 1
  }

  while IFS=$'\t' read -r pr_num branch; do
    [ -z "$pr_num" ] && continue

    # Derive issue number from branch name (e.g. worktree-gh-75 → 75)
    local dir_name="${branch#worktree-}"
    local issue_num="${dir_name#gh-}"

    # Verify it's actually a number
    [[ "$issue_num" =~ ^[0-9]+$ ]] || continue

    # Skip if issue is already closed or already Done in project
    local issue_state
    issue_state=$(gh issue view "$issue_num" --repo "$REPO" \
      --json state --jq '.state' 2>/dev/null) || continue
    [ "$issue_state" = "CLOSED" ] && continue

    log "PR #${pr_num} merged — moving issue #${issue_num} to Done"
    set_project_status "$issue_num" "Done" || true
    gh issue close "$issue_num" --repo "$REPO" \
      2>/tmp/claude-issues/last_error.txt || \
      err "Failed to close issue #${issue_num}: $(cat /tmp/claude-issues/last_error.txt)"
  done <<< "$merged"
}

# ── Clean up worktrees for merged PRs ───────────────────────────────────────
cleanup_merged_worktrees() {
  local worktree_dir="/home/marcus/projects/${REPO_NAME}/.claude/worktrees"
  [ -d "$worktree_dir" ] || return 0

  local merged_branches
  merged_branches=$(gh pr list --repo "$REPO" --state merged \
    --json headRefName \
    --jq '.[].headRefName' \
    2>/tmp/claude-issues/last_error.txt) || {
    err "Failed to list merged PRs: $(cat /tmp/claude-issues/last_error.txt)"
    return 1
  }

  while IFS= read -r branch; do
    [ -z "$branch" ] && continue
    # Branch is e.g. "worktree-gh-91"; worktree dir is e.g. "gh-91"
    local dir_name="${branch#worktree-}"
    local worktree_path="${worktree_dir}/${dir_name}"
    [ -d "$worktree_path" ] || continue

    log "Removing worktree for merged branch ${branch}: ${worktree_path}"
    git -C "/home/marcus/projects/${REPO_NAME}" worktree remove --force "$worktree_path" \
      2>/tmp/claude-issues/last_error.txt || \
      err "Failed to remove worktree ${worktree_path}: $(cat /tmp/claude-issues/last_error.txt)"
  done <<< "$merged_branches"
}

# ── Paginated project item fetcher ───────────────────────────────────────────
# Prints all project items as a JSON array to stdout.
# Each item: { number, state, status, labels, id }
fetch_all_project_items() {
  local query='query($login: String!, $num: Int!, $cursor: String) {
    user(login: $login) {
      projectV2(number: $num) {
        items(first: 100, after: $cursor) {
          pageInfo { hasNextPage endCursor }
          nodes {
            id
            content {
              ... on Issue {
                number
                state
                labels(first: 20) { nodes { name } }
              }
            }
            fieldValues(first: 20) {
              nodes {
                ... on ProjectV2ItemFieldSingleSelectValue {
                  name
                  field { ... on ProjectV2SingleSelectField { name } }
                }
              }
            }
          }
        }
      }
    }
  }'

  python3 - <<PYEOF
import subprocess, json, sys

query = """${query}"""
all_items = []
cursor = None

while True:
    args = [
        "gh", "api", "graphql",
        "-f", "query=" + query,
        "-f", "login=${REPO_OWNER}",
        "-F", "num=${PROJECT_NUMBER}",
        "-f", "cursor=" + (cursor or ""),
    ]
    result = subprocess.run(args, capture_output=True, text=True)
    if result.returncode != 0:
        print(result.stderr, file=sys.stderr)
        sys.exit(1)
    data = json.loads(result.stdout)["data"]["user"]["projectV2"]["items"]

    for node in data["nodes"]:
        c = node.get("content") or {}
        if not c.get("number"):
            continue
        status = next(
            (fv["name"] for fv in node.get("fieldValues", {}).get("nodes", [])
             if (fv.get("field") or {}).get("name") == "Status" and fv.get("name")),
            None
        )
        all_items.append({
            "id":     node["id"],
            "number": c["number"],
            "state":  c.get("state", ""),
            "status": status,
            "labels": [l["name"] for l in c.get("labels", {}).get("nodes", [])],
        })

    page = data["pageInfo"]
    if not page["hasNextPage"]:
        break
    cursor = page["endCursor"]

print(json.dumps(all_items))
PYEOF
}

# ── Detect conflicts in "In Progress" project items vs main ─────────────────
check_inprogress_conflicts() {
  [ -n "$PROJECT_NUMBER" ] || return 0

  local all_items items_json
  all_items=$(fetch_all_project_items 2>/tmp/claude-issues/last_error.txt) || {
    err "fetch_all_project_items failed: $(cat /tmp/claude-issues/last_error.txt)"
    return 1
  }

  items_json=$(echo "$all_items" | python3 -c "
import sys, json
items = json.load(sys.stdin)
for item in items:
    if item['state'] == 'OPEN' and item['status'] == 'In progress':
        print(json.dumps({'number': item['number'], 'labels': item['labels']}))
" 2>/dev/null)

  # Fetch main once before looping
  git -C "/home/marcus/projects/${REPO_NAME}" fetch origin main --quiet \
    2>/tmp/claude-issues/last_error.txt || \
    err "Failed to fetch origin/main: $(cat /tmp/claude-issues/last_error.txt)"

  while IFS= read -r item; do
    [ -z "$item" ] && continue
    local issue_num has_conflict
    issue_num=$(echo "$item" | python3 -c "import sys,json; print(json.load(sys.stdin)['number'])" 2>/dev/null) || continue
    has_conflict=$(echo "$item" | python3 -c "import sys,json; print('conflict' in json.load(sys.stdin)['labels'])" 2>/dev/null) || continue
    [ "$has_conflict" = "True" ] && continue  # Already flagged

    # Find the open PR for this issue by branch name pattern
    local branch
    branch=$(gh pr list --repo "$REPO" --state open \
      --json headRefName \
      --jq ".[] | select(.headRefName | test(\"gh-${issue_num}$\")) | .headRefName" \
      2>/dev/null | head -1) || true
    [ -z "$branch" ] && continue

    # Fetch the branch tip so merge-tree has up-to-date refs
    git -C "/home/marcus/projects/${REPO_NAME}" fetch origin "$branch" --quiet \
      2>/dev/null || continue

    local base_commit
    base_commit=$(git -C "/home/marcus/projects/${REPO_NAME}" \
      merge-base "origin/${branch}" "origin/main" 2>/dev/null) || continue

    if git -C "/home/marcus/projects/${REPO_NAME}" \
      merge-tree "$base_commit" "origin/${branch}" "origin/main" \
      2>/dev/null | grep -q "^<<<<<<< "; then
      log "Issue #${issue_num} (branch ${branch}) conflicts with main — adding 'conflict' label"
      gh issue edit "$issue_num" --repo "$REPO" --add-label "conflict" \
        2>/tmp/claude-issues/last_error.txt || \
        err "Failed to add conflict label to #${issue_num}: $(cat /tmp/claude-issues/last_error.txt)"
    fi
  done < <(echo "$items_json" | python3 -c "
import sys, json
data = sys.stdin.read().strip()
for line in data.splitlines():
    line = line.strip()
    if line:
        print(line)
" 2>/dev/null)
}

# ── Label "Ready" project items ─────────────────────────────────────────────
label_ready_issues() {
  [ -n "$PROJECT_NUMBER" ] || return 0

  local all_items
  all_items=$(fetch_all_project_items 2>/tmp/claude-issues/last_error.txt) || {
    err "fetch_all_project_items failed: $(cat /tmp/claude-issues/last_error.txt)"
    return 1
  }

  while IFS= read -r item; do
    [ -z "$item" ] && continue
    local issue_num has_label has_inprogress
    issue_num=$(echo "$item"     | python3 -c "import sys,json; print(json.load(sys.stdin)['number'])" 2>/dev/null) || continue
    has_label=$(echo "$item"     | python3 -c "import sys,json; print('claude' in json.load(sys.stdin)['labels'])" 2>/dev/null) || continue
    has_inprogress=$(echo "$item"| python3 -c "import sys,json; print('in-progress' in json.load(sys.stdin)['labels'])" 2>/dev/null) || continue

    if [ "$has_label" = "False" ] && [ "$has_inprogress" = "False" ]; then
      log "Issue #${issue_num} is Ready — adding 'claude' label"
      gh issue edit "$issue_num" --repo "$REPO" --add-label "claude" \
        2>/tmp/claude-issues/last_error.txt || \
        err "Failed to label #${issue_num}: $(cat /tmp/claude-issues/last_error.txt)"
    fi
  done < <(echo "$all_items" | python3 -c "
import sys, json
for item in json.load(sys.stdin):
    if item['state'] == 'OPEN' and item['status'] == 'Ready':
        print(json.dumps({'number': item['number'], 'labels': item['labels']}))
" 2>/dev/null)
}

# ── Ensure required labels exist ─────────────────────────────────────────────
ensure_labels() {
  local -A labels=(
    [claude]="0075ca"
    [in-progress]="e4e669"
    [conflict]="d73a4a"
    [conflict-in-progress]="e99695"
    [resolved]="0e8a16"
  )
  for name in "${!labels[@]}"; do
    gh label create "$name" --repo "$REPO" --color "${labels[$name]}" --force \
      2>/tmp/claude-issues/last_error.txt || \
      err "Failed to ensure label '${name}': $(cat /tmp/claude-issues/last_error.txt)"
  done
}

# ── One-at-a-time mode ──────────────────────────────────────────────────────
pick_lowest_issue() {
  local status="$1"
  local all_items
  all_items=$(fetch_all_project_items 2>/tmp/claude-issues/last_error.txt) || {
    err "fetch_all_project_items failed: $(cat /tmp/claude-issues/last_error.txt)"
    return 1
  }
  echo "$all_items" | python3 -c "
import sys, json
status = sys.argv[1]
nums = [i['number'] for i in json.load(sys.stdin)
        if i['state'] == 'OPEN' and i['status'] == status]
print(min(nums)) if nums else print('')
" "$status" 2>/dev/null
}

set_project_status() {
  local issue_num="$1" status="$2"

  # Fetch project metadata: project ID, status field ID, and the option ID for the desired status
  local meta
  meta=$(gh api graphql -f query='query($login: String!, $num: Int!) {
    user(login: $login) {
      projectV2(number: $num) {
        id
        fields(first: 20) {
          nodes {
            ... on ProjectV2SingleSelectField {
              id
              name
              options { id name }
            }
          }
        }
      }
    }
  }' -f login="$REPO_OWNER" -F num="$PROJECT_NUMBER" 2>/tmp/claude-issues/last_error.txt) || {
    err "Failed to fetch project metadata: $(cat /tmp/claude-issues/last_error.txt)"
    return 1
  }

  local project_id field_id option_id
  project_id=$(echo "$meta" | python3 -c "import sys,json; print(json.load(sys.stdin)['data']['user']['projectV2']['id'])")
  field_id=$(echo "$meta"   | python3 -c "
import sys,json
d=json.load(sys.stdin)
for f in d['data']['user']['projectV2']['fields']['nodes']:
    if f.get('name') == 'Status':
        print(f['id']); break")
  option_id=$(echo "$meta"  | python3 -c "
import sys,json,sys as _sys
status=sys.argv[1]
d=json.load(_sys.stdin)
for f in d['data']['user']['projectV2']['fields']['nodes']:
    if f.get('name') == 'Status':
        for o in f.get('options',[]):
            if o['name'] == status:
                print(o['id']); break" "$status")

  if [ -z "$project_id" ] || [ -z "$field_id" ] || [ -z "$option_id" ]; then
    err "Could not resolve project/field/option IDs for status '${status}'"
    return 1
  fi

  # Find the project item ID for this issue
  local all_items item_id
  all_items=$(fetch_all_project_items 2>/tmp/claude-issues/last_error.txt) || {
    err "fetch_all_project_items failed: $(cat /tmp/claude-issues/last_error.txt)"
    return 1
  }
  item_id=$(echo "$all_items" | python3 -c "
import sys, json
num = int(sys.argv[1])
for item in json.load(sys.stdin):
    if item['number'] == num:
        print(item['id']); break
" "$issue_num" 2>/dev/null)

  if [ -z "$item_id" ] || [ "$item_id" = "null" ]; then
    err "Issue #${issue_num} not found in project"
    return 1
  fi

  gh api graphql -f query='mutation($project: ID!, $item: ID!, $field: ID!, $option: String!) {
    updateProjectV2ItemFieldValue(input: {
      projectId: $project
      itemId: $item
      fieldId: $field
      value: { singleSelectOptionId: $option }
    }) { projectV2Item { id } }
  }' -f project="$project_id" -f item="$item_id" -f field="$field_id" -f option="$option_id" \
    >/dev/null 2>/tmp/claude-issues/last_error.txt || {
    err "Failed to set status '${status}' on issue #${issue_num}: $(cat /tmp/claude-issues/last_error.txt)"
    return 1
  }

  log "Issue #${issue_num} moved to '${status}' in project"
}

wait_for_session() {
  local session="$1"
  log "Waiting for tmux session '${session}' to finish..."
  while tmux has-session -t "$session" 2>/dev/null; do
    check_token_limits || true
    resume_waiting_sessions || true
    sleep "$POLL_INTERVAL"
  done
  log "Session '${session}' finished."
}

run_one_mode() {
  log "Starting --one mode (sequential, lowest-number-first)"
  ensure_labels

  while true; do
    local issue_num issue_data issue_title issue_body issue_labels session_name

    # 1. Pick next issue: In Progress → Ready → Backlog
    issue_num=""
    picked_from=""
    for status in "In progress" "Ready" "Backlog"; do
      issue_num=$(pick_lowest_issue "$status") || true
      if [ -n "$issue_num" ] && [ "$issue_num" != "null" ]; then
        picked_from="$status"
        log "Picked issue #${issue_num} from '${status}'"
        break
      fi
    done

    if [ -z "$issue_num" ] || [ "$issue_num" = "null" ]; then
      log "No issues left in In Progress, Ready, or Backlog. Done."
      return 0
    fi

    # 2. Fetch issue details
    issue_data=$(gh issue view "$issue_num" --repo "$REPO" \
      --json number,title,body,labels 2>/tmp/claude-issues/last_error.txt) || {
      err "Failed to fetch issue #${issue_num}: $(cat /tmp/claude-issues/last_error.txt)"
      return 1
    }
    issue_title=$(echo "$issue_data" | python3 -c "import sys,json; print(json.load(sys.stdin)['title'])")
    issue_body=$(echo "$issue_data"  | python3 -c "import sys,json; print(json.load(sys.stdin)['body'] or '')")
    issue_labels=$(echo "$issue_data" | python3 -c "import sys,json; d=json.load(sys.stdin); print(json.dumps([l['name'] for l in d.get('labels',[])]))")

    # 3. Move to In Progress if not already there
    if [ "$picked_from" != "In progress" ]; then
      set_project_status "$issue_num" "In progress" || true
    fi

    # 5. Spawn agent and wait for it to finish
    session_name="gh-${issue_num}"
    if ! tmux has-session -t "$session_name" 2>/dev/null; then
      spawn_worker "$issue_num" "$issue_title" "$issue_body" "$issue_labels" || {
        err "spawn_worker failed for issue #${issue_num}"
        return 1
      }
    else
      log "Session '${session_name}' already running — waiting for it to finish"
    fi
    wait_for_session "$session_name"

    # 6. Find the PR for this issue
    local pr_num pr_mergeable
    pr_num=$(gh pr list --repo "$REPO" --state open \
      --json number,headRefName \
      --jq ".[] | select(.headRefName | test(\"gh-${issue_num}$\")) | .number" \
      2>/dev/null | head -1) || true

    if [ -z "$pr_num" ]; then
      log "No open PR found for issue #${issue_num} — skipping merge"
      continue
    fi

    # 7. Wait for GitHub to compute mergeability, then merge if clean
    log "PR #${pr_num} found for issue #${issue_num} — checking mergeability..."
    local attempts=0
    pr_mergeable="UNKNOWN"
    while [ "$pr_mergeable" = "UNKNOWN" ] && [ "$attempts" -lt 10 ]; do
      sleep 5
      pr_mergeable=$(gh pr view "$pr_num" --repo "$REPO" \
        --json mergeable --jq '.mergeable' 2>/dev/null) || pr_mergeable="UNKNOWN"
      attempts=$((attempts + 1))
    done

    if [ "$pr_mergeable" = "MERGEABLE" ]; then
      log "PR #${pr_num} is clean — merging"
      gh pr merge "$pr_num" --repo "$REPO" --squash --auto \
        2>/tmp/claude-issues/last_error.txt || \
        err "Failed to merge PR #${pr_num}: $(cat /tmp/claude-issues/last_error.txt)"
    else
      log "PR #${pr_num} is not mergeable (${pr_mergeable}) — skipping auto-merge"
    fi
  done
}

# ── Main loop ───────────────────────────────────────────────────────────────
log "Ralph Wiggum orchestrator started (polling every ${POLL_INTERVAL}s)"

if $ONE_MODE; then
  run_one_mode
  exit 0
fi

ensure_labels
restore_state

while true; do
  # 1. Token limit: check logs and resume if ready
  check_token_limits || err "check_token_limits encountered an error"
  resume_waiting_sessions || err "resume_waiting_sessions encountered an error"

  # 1b. Move issues with merged PRs to Done, then clean up worktrees
  close_done_issues || err "close_done_issues encountered an error"
  cleanup_merged_worktrees || err "cleanup_merged_worktrees encountered an error"

  # 1c. Re-queue in-progress issues whose agent session has died
  recover_stale_inprogress || err "recover_stale_inprogress encountered an error"

  # 2–4. Skip spawning/labeling/conflict-resolution while globally paused
  if is_globally_paused; then
    local until_ts
    until_ts=$(cat "$GLOBAL_PAUSE_FILE")
    log "Globally paused (Claude rate limit) — waiting until $(date -d @"$until_ts" 2>/dev/null || echo "@${until_ts}")"
  else
    # 2. Flag "In Progress" issues whose branches conflict with main
    check_inprogress_conflicts || err "check_inprogress_conflicts encountered an error"

    # 3. Label issues that reached "Ready" status in the GitHub Project
    label_ready_issues || err "label_ready_issues encountered an error"

    # 4. Pick up new issues labeled 'claude', skipping unresolved dependencies
    while IFS= read -r issue_json; do
      [ -z "$issue_json" ] && continue

      local_num=$(echo "$issue_json"    | python3 -c "import sys,json; d=json.load(sys.stdin); print(d['number'])" 2>/tmp/claude-issues/last_error.txt) || {
        err "Failed to parse issue number from JSON: $(cat /tmp/claude-issues/last_error.txt)"
        continue
      }
      local_title=$(echo "$issue_json"  | python3 -c "import sys,json; d=json.load(sys.stdin); print(d['title'])" 2>/tmp/claude-issues/last_error.txt) || {
        err "Failed to parse issue title from JSON: $(cat /tmp/claude-issues/last_error.txt)"
        continue
      }
      local_body=$(echo "$issue_json"   | python3 -c "import sys,json; d=json.load(sys.stdin); print(d['body'] or '')" 2>/tmp/claude-issues/last_error.txt) || {
        err "Failed to parse issue body from JSON: $(cat /tmp/claude-issues/last_error.txt)"
        continue
      }
      local_labels=$(echo "$issue_json" | python3 -c "import sys,json; d=json.load(sys.stdin); print(json.dumps([l['name'] for l in d.get('labels',[])]))" 2>/tmp/claude-issues/last_error.txt) || {
        err "Failed to parse issue labels from JSON: $(cat /tmp/claude-issues/last_error.txt)"
        local_labels="[]"
      }

      if tmux has-session -t "gh-${local_num}" 2>/dev/null; then
        continue  # Already running
      fi

      if check_dependencies_met "$local_body"; then
        spawn_worker "$local_num" "$local_title" "$local_body" "$local_labels" || \
          err "spawn_worker failed for issue #${local_num}"
      fi
    done < <(gh issue list --repo "$REPO" --label "claude" --state open \
               --json number,title,body,labels --jq '.[]' 2>/tmp/claude-issues/last_error.txt \
               || err "gh issue list failed: $(cat /tmp/claude-issues/last_error.txt)")

    # 5. Check for merge conflicts in open PRs
    while IFS=$'\t' read -r pr_num branch; do
      [ -z "$pr_num" ] && continue
      # Skip if the linked issue is already being resolved
      dir_name="${branch#worktree-}"
      derived_issue="${dir_name#gh-}"
      if tmux has-session -t "conflict-${derived_issue}" 2>/dev/null; then
        continue
      fi
      resolve_conflict "$pr_num" "$branch" || \
        err "resolve_conflict failed for PR #${pr_num}"
    done < <(gh pr list --repo "$REPO" --state open \
               --json number,headRefName,mergeable \
               --jq '.[] | select(.mergeable == "CONFLICTING") | [.number, .headRefName] | @tsv' \
               2>/tmp/claude-issues/last_error.txt \
               || err "gh pr list failed: $(cat /tmp/claude-issues/last_error.txt)")
  fi

  sleep "$POLL_INTERVAL"
done
