---
name: reflection--code-review
description: >
  Structured methodology for reflecting on code quality after building it. Catches systematic patterns,
  security vulnerabilities, spec compliance gaps, and scores output quality. Use after any build pass
  to audit code against its spec before shipping.
---

# Reflection: Code Review

## Purpose
Structured methodology for reflecting on code quality after building it. This is NOT a standard code review — it's a reflection loop designed to catch systematic patterns and score output quality for eval-driven improvement.

## Methodology

### Step 1: Read Before Judging
Read ALL of these before writing a single score:
1. The spec (what was supposed to be built)
2. The builder's output summary (what was claimed to be built)
3. Any marketing copy that should appear in the product
4. The actual code (the truth)

**Mandatory full file coverage:** Before writing ANY findings, list every file in the codebase and confirm each was read. If a file was not reviewed, flag it as "NOT REVIEWED — potential blind spot." Never submit findings without 100% file coverage. Bugs hide in the files you skip.

### Step 2: Systematic Scan
Run through the codebase methodically:

**File-by-file:**
- For each file created, check: does it serve a purpose in the spec?
- For each spec requirement, check: is there a file that implements it?
- Gap analysis: what's in the spec but not in the code? What's in the code but not in the spec?

**Copy integration check:**
```bash
# Check for placeholder text
grep -ri "lorem\|placeholder\|todo\|tbd\|your .* here\|coming soon\|example\.\|sample " *.html *.js *.jsx *.tsx
```

**Security quick-scan:**
```bash
# Check for hardcoded secrets
grep -ri "api.key\|secret\|password\|token.*=\|sk_\|pk_\|re_" --include="*.js" --include="*.ts" --include="*.env"
```

**Rate limiting architecture review:**
Don't just check "does rate limiting exist." Verify ALL of these:
- What identifier is used? (email, IP, user ID, API key?)
- Can the identifier be rotated? (new email = new limit? IP rotation?)
- Is the limit enforced server-side or client-side only?
- On serverless (Vercel, Lambda): is the rate limiter in-memory? If yes, it resets on every cold start — flag as **ineffective**.
- Does the rate limit apply to ALL paths that consume resources (API calls, LLM calls, file uploads)?

**Payment flow checklist (mandatory when Stripe or any payment system is present):**
- Webhook signature verification (`stripe.webhooks.constructEvent` with raw body)
- Checkout input validation — is the product/price slug validated against an allowlist before creating a session?
- Price map integrity — can an attacker substitute a different price ID?
- Success URL / cancel URL — do they leak tokens, keys, or session data?
- Idempotency — does the webhook handler check for duplicate events?

**Async/await trace (mandatory):**
For every async function call in the codebase, verify:
- Is the call `await`ed? A missing `await` on an async function silently returns a Promise (truthy), bypassing the intended check.
- Is the return value used? A function may be called correctly but its return value ignored (dead safety check).
- Does the function appear in the safety/validation layer? If so, a missing await or unused return is **CRITICAL** severity.
- **When a missing `await` is found, trace the EXACT runtime behavior step by step:** (1) What does the Promise object look like when used synchronously? (2) What happens when you access `.allowed` or `.remaining` on a pending Promise? (3) Does the subsequent conditional treat `undefined` as truthy or falsy? (4) Write the actual execution path, not the intended execution path. Common pitfall: `!undefined` is `true`, so `if (!limit.allowed)` where `limit` is a Promise means `.allowed` is `undefined`, `!undefined` is `true`, and the check BLOCKS all users — the opposite of a bypass.

### Step 3: Score with Evidence
For every score you give, cite specific evidence:
- **Good:** "Spec says 5 API endpoints. Code has 5 matching routes in server.js:12-45. Score: 95/100 (missing one edge case handler)"
- **Bad:** "Code quality seems good. Score: 85/100" — NO. Where? What specifically?

### Step 4: Actionable Feedback
Every issue must be fixable in a single pass:
- **File path** — exact file
- **Line number or section** — where the issue is
- **What's wrong** — specific problem
- **How to fix** — exact change needed
- **Priority** — must-fix vs nice-to-have

### Step 5: Pattern Recognition
After individual scoring, step back and ask:
- Is there a recurring pattern? (e.g., "always forgets meta tags")
- Is there a skill gap? (e.g., "doesn't use the accessibility-review skill")
- Is there a context gap? (e.g., "didn't receive enough detail from the spec about X")

Document patterns — they drive skill improvements.

### Step 6: System-Level Bypass Thinking
After finding individual bugs, step back and ask: "How would an attacker bypass the overall system?" Think about:
- **Identifier rotation** — new emails, new IPs, new accounts to dodge rate limits or abuse limits
- **Race conditions** — time-of-check vs time-of-use gaps between validation and action
- **Client-side checks that can be skipped** — anything enforced only in the browser is not enforced at all
- **Dead safety code** — functions that exist but aren't called in the actual execution path (especially common with middleware that's defined but never `app.use()`'d)

### Step 7: Attacker Persona (Mandatory Output Section)
After completing all line-by-line findings, write a section titled "## Attacker Persona" at the end of your review. This section MUST answer these specific questions:

1. **"If I wanted unlimited free usage of this service, what would I try?"** — Enumerate every path: identifier rotation, endpoint abuse, client-side bypass, webhook forgery, etc.
2. **"If I wanted to use this service without paying, what paths exist?"** — Check for unauthenticated routes that serve paid features, missing payment verification on protected resources, trial abuse vectors.
3. **"What identifiers does the system use for rate limiting/auth? Can any be rotated, spoofed, or omitted?"** — List every identifier (email, IP, API key, session token, fingerprint) and assess each for spoofability.
4. **"Which safety checks exist as code but are not called, not awaited, or have their return values ignored?"** — Cross-reference every validation/auth/rate-limit function definition against its actual call sites. Dead safety code is worse than no safety code — it creates false confidence.

This section forces system-level thinking AFTER the line-by-line review is complete. Do not skip it, even if no issues were found — state explicitly "No bypass paths identified" with reasoning.

## Anti-Patterns (Don't Do This)
- **Rubber-stamping:** Giving 90+ across the board to keep things moving. If the code is bad, say so.
- **Bike-shedding:** Spending 80% of the review on variable naming while missing a SQL injection. Prioritize by impact.
- **Rewriting:** Your job is to review, not rewrite. Give specific fixes, don't produce alternative implementations.
- **Forgetting colorblind users:** ALWAYS check that color is not the sole indicator of state. Use icons, text labels, or patterns alongside color.

## Output Format
Your output MUST include:
1. Scores table with evidence
2. Critical issues with file:line references
3. "What Was Done Well" section (mandatory — calibrates future output)
4. Specific action items if score < 80%