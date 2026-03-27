---
name: task-management
description: >
  Manage tasks via shared TASKS.md. Invoke when the user asks about tasks, adds/completes them,
  or needs commitment tracking.
---

# Task Management

## Core Loop

Every task interaction follows: **Read -> Act -> Surface what matters**.

1. **Read** `TASKS.md` in the current working directory (create from template below if missing)
2. **Act** on the user's intent (add, complete, move, review — see Actions)
3. **Surface** — always end with: what's urgent, what's stale, what needs a decision

## File Format

```markdown
# Tasks

## Active
- [ ] **Task title** - context, for whom, due date
  - Sub-details if needed

## Waiting On
- [ ] **Item** - who/what you're waiting on, since date

## Someday

## Done
- [x] ~~Task~~ (completed date)
```

Conventions: **Bold** titles. Include `for [person]` on commitments, `due [date]` on deadlines, `since [date]` on waiting items. Prune Done items older than 1 week.

## Actions

| User says | You do |
|-----------|--------|
| "what's on my plate" / "my tasks" | Read file. Summarize Active + Waiting On. Flag overdue/stale items first. |
| "add task" / "remind me to" | Add to Active with `- [ ]` format. Include context if given. |
| "done with X" / "finished X" | Mark `[x]`, strikethrough, add date, move to Done. |
| "what am I waiting on" | List Waiting On items. Flag anything waiting 3+ days. |
| After meetings/conversations | Offer to extract: commitments made, action items assigned, follow-ups mentioned. Ask before adding. |

## Triage Logic

When reviewing tasks, apply this before presenting:

- **Overdue** (past due date) — flag immediately, ask for new date or escalation
- **Stale waiting** (3+ days in Waiting On) — suggest a follow-up nudge
- **No due date on Active** — prompt user to set one or move to Someday
- **Active list > 7 items** — suggest moving low-priority items to Someday

Always lead with the item that needs attention soonest.