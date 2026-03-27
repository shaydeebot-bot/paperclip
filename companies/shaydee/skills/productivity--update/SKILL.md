---
name: productivity-update
description: >
  Sync tasks and refresh working memory mid-session. Invoke any time work is completed, a status
  update is needed, or the user asks about progress — even casually ("where are we?", "what's next?",
  "any updates?"). Also use when resuming after any interruption.
---

# Productivity Update

Refresh task state, sync TASKS.md, and determine the next action.

## Output First

Produce this dashboard immediately after syncing — no preamble:

```
## Status Update — [date]

**Done since last update:** [task(s) completed]
**In Progress:** [current task(s)] — or "None"
**Up Next:** [next task(s)]
**Blockers:** [issue] — or "None"

> **Next action:** [what you will do now — start next task / wait / escalate]
```

## Sync Sequence

### 1. Read + Reconcile TASKS.md

- Read `TASKS.md`
- Check for any completed work since last update
- Move completed tasks to "Done" with date
- Move the next queued task to "In Progress" if starting now
- **Append-only on Done entries** — never rewrite existing lines

### 2. Check Context

Re-read relevant context files if the work phase changed or you're resuming after interruption:
- `MEMORY.md` or `CLAUDE.md` — for any updated project state or user decisions
- Recent output files — verify completion and extract key results

### 3. Print Dashboard + Act

Output the dashboard format above, then immediately execute the next action (start next task, escalate blocker, or report idle state to user).