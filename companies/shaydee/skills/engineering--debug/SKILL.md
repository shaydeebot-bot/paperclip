---
name: debug
description: >
  Structured debugging methodology — reproduce, isolate, diagnose, fix, verify.
  Use when encountering stack traces, error messages, failing tests, or unexpected behavior.
  Prevents guessing and ensures root cause is found systematically.
---

# Debug

```
REPRODUCE -> ISOLATE -> DIAGNOSE -> FIX -> VERIFY
```

Never guess. Never skip to a fix. Narrow systematically.

## Step 1: REPRODUCE

Run the failing command and capture the exact output. Establish:
- Exact input/action that triggers it
- Expected vs actual behavior
- 100% reproducible or intermittent?

If the error is a clear stack trace, skip to ISOLATE — you already have the failure point.

## Step 2: ISOLATE

Narrow the search space. **Max 3 targeted searches before forming a hypothesis.**

- Add logging at the entry point of the suspected system
- Binary search: does the bug occur before or after the midpoint?
- Check recent changes: `git log --oneline -10`, `git diff HEAD~3`
- Check if the bug exists on main or only the current branch
- Eliminate: is it the framework, library, or your code?

## Step 3: DIAGNOSE

Read the evidence, don't assume. Check in this order (most common causes first):

1. **Null/undefined** — missing guard, unexpected API response shape
2. **Async/await** — missing await, unhandled promise, race condition
3. **Wrong type** — string where number expected, type coercion
4. **Environment** — wrong env vars, missing secrets, wrong DB, stale build
5. **Logic error** — off-by-one, wrong operator, inverted condition
6. **State** — stale data, cache, mutation of shared state

## Step 4: FIX

Minimal change that addresses the **root cause**, not the symptom.
- Don't add workarounds around broken code — fix the broken code
- If the fix is non-obvious, add a comment explaining *why*
- If the bug was possible due to a missing guard, add the guard

## Step 5: VERIFY

- Reproduce the original scenario — does it pass now?
- Run the test suite
- Check adjacent code paths that touch the same data/function
- If intermittent: run multiple times or add a regression test

## When Your Theory Is Wrong

If your first hypothesis doesn't pan out after 2 checks:

1. **Stop.** Re-read the actual error output from scratch.
2. **Question your assumptions.** What did you assume was true but didn't verify?
3. **Widen the search.** The bug may not be where you think — check the layer above or below.
4. **Check for multiple bugs.** Sometimes two issues mask each other.
5. **Read the git blame** on the failing line — was it recently changed?

## Output Format

```
## Root Cause
[One sentence: what's broken and why]

## Fix
[Code diff or specific change]

## Verification
[What was tested, what passed]

## Investigation Trail
[Steps taken to isolate — for the record]
```

Lead with root cause + fix. Investigation trail is supporting detail.