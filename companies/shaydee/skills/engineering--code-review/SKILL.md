---
name: code-review
description: >
  Security-focused code review. Scans for vulnerabilities, injection risks, exposed secrets,
  auth flaws, and OWASP Top 10 issues. Use when reviewing code that handles auth, user input,
  sensitive data, or before any production deployment.
---

# Security Code Review

## Process

1. **Scan** — Run the rapid checklist below against all changed/target files
2. **Trace** — Follow data from user input through processing to storage/output
3. **Assess** — Classify each finding by severity
4. **Report** — Output severity-sorted findings with concrete remediations

## Rapid Scan Checklist

Run through every item. Check = investigated, not just glanced at.

| # | Check | What to look for |
|---|-------|-----------------|
| 1 | **Secrets** | API keys, tokens, passwords hardcoded or in committed files |
| 2 | **SQL/NoSQL injection** | Unsanitized input in queries, raw string concatenation |
| 3 | **XSS** | User input rendered without escaping in HTML/templates |
| 4 | **Auth gaps** | Routes missing auth middleware, broken access control |
| 5 | **CSRF** | State-changing endpoints without CSRF tokens |
| 6 | **SSRF** | User-controlled URLs fetched server-side |
| 7 | **Path traversal** | User input in file paths without sanitization |
| 8 | **Insecure deserialization** | Untrusted data deserialized without validation |
| 9 | **Error leaks** | Stack traces, DB errors, internal paths exposed to client |
| 10 | **Input validation** | Missing size limits, type checks, allowlist filtering |
| 11 | **Crypto** | Weak algorithms, hardcoded IVs, custom crypto implementations |
| 12 | **Headers** | Missing security headers (CSP, HSTS, X-Frame-Options) |
| 13 | **Dependencies** | Known CVEs in package.json/requirements.txt |
| 14 | **Config** | Debug mode on, CORS wildcard, verbose logging in prod |

## Deep Analysis

After the rapid scan, go deeper on anything flagged:

### Map attack surface
- List all endpoints that accept user input
- List all external service integrations
- Identify data stores and what's in them (PII, credentials, tokens)

### Trace data flows
- Follow user input from entry -> validation -> processing -> storage -> output
- Flag anywhere input is used without sanitization

### Check auth chain
- Verify every protected route has middleware applied
- Check token validation, expiry, refresh logic
- Verify authorization (not just authentication) — can user A access user B's data?

### Scan dependencies
- Run `npm audit` / `pip audit` mentally — flag Critical and High CVEs
- Check for outdated packages with known vulnerabilities

## Severity Levels

- **CRITICAL** — Exploitable now, user data at risk. Fix immediately.
- **HIGH** — Significant risk, fix within 24h.
- **MEDIUM** — Real issue, fix within the week.
- **LOW** — Best practice gap.

## Output Format

### 1. Summary table (read in 10 seconds)

```
| # | Severity | File:Line | Issue | Fix |
|---|----------|-----------|-------|-----|
| 1 | CRITICAL | auth.js:42 | JWT secret hardcoded | Move to env var |
| 2 | HIGH | api.js:88 | SQL injection in search | Use parameterized query |
```

### 2. Detailed findings (for each CRITICAL/HIGH)

```
### [SEVERITY] — [Issue title]
**Where**: `file:line`
**What**: [Description of the vulnerability]
**Why it matters**: [What an attacker could do]
**Fix**: [Concrete code change or specific instruction]
```

### 3. Verdict

State whether the review is clean or has issues found, and list the CRITICAL/HIGH items that must be fixed before shipping.