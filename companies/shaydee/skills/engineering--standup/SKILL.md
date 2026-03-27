---
name: standup
description: >
  Generate a concise standup update summarizing work completed, work in progress, and blockers.
  Use at the end of a build session or when summarizing progress. Covers yesterday/today/blockers
  format with guidelines for outcome-focused writing.
---

# Standup

Generate a concise standup update from recent work. Covers yesterday, today, and blockers.

## Standup Format

```
## Standup — [date]

**Yesterday**
- [What was completed — specific, outcome-focused]
- [Include commit refs or PR numbers if available]

**Today**
- [What is planned next]

**Blockers**
- [Anything blocking progress — or "None"]
```

## How to Generate

1. **Check task tracker** — what moved to Done recently and what's In Progress
2. **Check git log** — `git log --oneline --since="24 hours ago"` for recent commits
3. **Synthesize** — group commits and tasks into clear bullets

## Writing Guidelines

- **Yesterday**: lead with the outcome, not the activity. "Shipped webhook retry logic" not "Worked on webhooks".
- **Today**: be specific. "Implementing security review for auth module" not "Working on security".
- **Blockers**: name the specific blocker and what's needed to unblock. Don't just say "waiting on feedback" — say what feedback and from whom.
- Keep each bullet to one line.
- If nothing was completed (e.g. long research spike), say so — don't pad.

## Output Destinations

The standup can be:
- Posted directly in the conversation
- Appended to a task tracker under a Standup section
- Formatted for Slack (use `>` blockquotes) if specified