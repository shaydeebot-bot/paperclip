---
name: customer-support--knowledge-management
description: >
  Write and maintain KB articles from resolved support issues. Use when a ticket is resolved and should be documented, when updating existing articles, or when creating how-to guides, troubleshooting docs, or FAQ entries.
---

# Knowledge Management

## Decision

```
Resolved ticket, new feature, or content review?
  ├─ No article exists        → WRITE NEW using template below
  ├─ Article exists, correct  → UPDATE (add missing detail, refresh steps)
  ├─ Article exists, wrong    → REWRITE (correct the steps, note what changed)
  ├─ Article covers 2+ topics → SPLIT into focused articles
  ├─ Feature was removed      → ARCHIVE (move to deprecated, add redirect note)
  └─ Duplicate articles exist → MERGE (keep the better one, redirect the other)
```

## Article Template

Adapt by type. Required sections marked **R**, optional marked **O**.

```markdown
# [Title — format by type]
#   How-to:          "Connect [X] to [Y]" or "Set up [feature]" — start with verb
#   Troubleshooting: "Fix: [error message or symptom]" — include exact error text
#   FAQ:             "How do I [action]?" or "Why does [thing] happen?" — question format
#   Known issue:     "[Feature]: [symptom] (workaround available)" — state + status

[1-2 sentences: what this covers, who needs it] **R**

## Steps **R**

1. Go to **Settings > Integrations > API Keys**
2. Click **Generate New Key**
3. Copy the key — you should see a green "Copied" confirmation

[Numbered list. Each step starts with a verb. After key steps, state the expected result.]
[For FAQ: replace with a direct answer paragraph, no numbered steps needed.]

## What Didn't Work **O — include for troubleshooting, skip for how-tos/FAQ**

- **[Approach that seems right]** — fails because [reason]
- **[Another wrong path]** — this only works for [different scenario]

## Context **O — only if the "why" prevents repeat issues**

[Why this happens, edge cases, version-specific behavior.]

## Next Steps **R**

- **Verify**: [How to confirm it worked]
- **Related**: [What to do next, or link to companion article]
- **Still stuck**: Contact support at [channel]

---
*Category: [area] | Tags: [searchable terms] | Updated: [date]*
```

## Rules

- **One problem, one article** — if it covers two topics, split it.
- **Use customer language** — match the words customers type in search, not internal jargon.
- **Test the steps** — follow them yourself or verify against the actual resolved ticket.

## Maintenance Triggers

When processing a ticket or reviewing content, act on these:

| You notice... | Do this |
|---|---|
| Repeat tickets with no article | Write one — this is a content gap |
| Ticket contradicts an existing article | Rewrite the article with correct steps |
| Product UI/API changed | Update affected articles to match current state |
| Article covers a removed feature | Archive it with a note pointing to the replacement |