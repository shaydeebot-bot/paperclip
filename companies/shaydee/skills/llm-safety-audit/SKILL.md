---
name: llm-safety-audit
description: >
  Audit and harden any project that uses LLM APIs or AI services. Covers prompt injection prevention, input/output sanitization, cost controls, abuse detection, API key protection, and data leakage. Use whenever a project sends user input to an LLM/AI API.
---

# LLM & API Safety Audit

## When to Use

Run this skill on ANY project that:
- Sends user input to an LLM API (OpenAI, Anthropic, Google, etc.)
- Stores or processes API keys for AI services
- Allows users to query data via natural language
- Uses AI-generated output in responses shown to users
- Has a cost-per-query model (token-based billing)

## Process

1. **Discover** — Identify all LLM/API touchpoints in the codebase
2. **Audit** — Run the full checklist against each touchpoint
3. **Classify** — Severity-rate each finding
4. **Remediate** — Apply fixes using a shared safety module or inline
5. **Test** — Write tests to verify protections work
6. **Report** — Output findings and applied remediations

## Audit Checklist

### A. Prompt Injection Prevention

| # | Check | What to look for | Severity |
|---|-------|-----------------|----------|
| A1 | **System prompt hardening** | System prompt must include explicit instructions to refuse role changes, credential leaks, and meta-instruction following | Critical |
| A2 | **Input sanitization** | User input stripped of control chars, chat delimiters (`<\|im_start\|>`), code fence injections | Critical |
| A3 | **Input/instruction separation** | User content clearly delineated from system instructions (labeled as "untrusted input") | High |
| A4 | **Jailbreak resistance** | System prompt resists common patterns: "ignore previous instructions", "you are now DAN", role injection | High |
| A5 | **Indirect injection** | Data from external sources (CSV, APIs, databases) treated as untrusted — could contain injection payloads | High |
| A6 | **Multi-turn injection** | If conversation history is included, prior assistant responses are not trusted as instructions | Medium |

### B. Input Validation

| # | Check | What to look for | Severity |
|---|-------|-----------------|----------|
| B1 | **Length limits** | Max question/prompt length enforced (2000-4000 chars typical) | High |
| B2 | **Type validation** | Input is string, not object/array/number (prevents prototype pollution) | Medium |
| B3 | **Encoding validation** | UTF-8 only, no null bytes, no control characters | Medium |
| B4 | **File upload validation** | If files are processed (CSV, PDF), size limits and content-type validation applied | Medium |
| B5 | **Source ID validation** | If user selects data sources, IDs are validated for type and ownership | Medium |

### C. Output Sanitization

| # | Check | What to look for | Severity |
|---|-------|-----------------|----------|
| C1 | **Credential stripping** | LLM responses scanned for accidentally leaked API keys, tokens, JWTs | Critical |
| C2 | **Path stripping** | Server file paths (C:\, /home/, /var/) removed from output | High |
| C3 | **System prompt leakage** | LLM cannot be tricked into outputting its system prompt | High |
| C4 | **XSS in output** | If LLM output is rendered as HTML, it's sanitized to prevent XSS | High |
| C5 | **Code execution** | LLM output is never evaluated as code (no `eval()`, no shell exec) | Critical |
| C6 | **Data leakage** | Responses don't include data from other users (cross-tenant isolation) | Critical |

### D. Cost Controls & Abuse Prevention

| # | Check | What to look for | Severity |
|---|-------|-----------------|----------|
| D1 | **Per-user rate limiting** | Rate limit on LLM query endpoint (e.g., 10/min per user) | High |
| D2 | **Per-IP rate limiting** | IP-based rate limit as fallback for unauthenticated abuse | High |
| D3 | **Token budget** | Max tokens per request capped (prevent runaway costs) | High |
| D4 | **Daily cost cap** | Per-user daily spend limit enforced | Medium |
| D5 | **Query counting** | Monthly/daily query counts tracked and enforced per plan tier | Medium |
| D6 | **Streaming abuse** | If using streaming, connection timeout prevents infinite streams | Low |
| D7 | **Batch/loop prevention** | Detect and block automated scripted queries (same question repeated, sequential enumeration) | Medium |

### E. API Key Protection

| # | Check | What to look for | Severity |
|---|-------|-----------------|----------|
| E1 | **Keys in env vars** | API keys stored in environment variables, never hardcoded | Critical |
| E2 | **Keys not in git** | .env files in .gitignore, no keys in commit history | Critical |
| E3 | **Keys not in frontend** | API keys never sent to or accessible from the browser/client | Critical |
| E4 | **Keys not in logs** | API keys not logged in console.log, error messages, or monitoring | High |
| E5 | **Keys not in responses** | API keys never included in API responses or error messages | High |
| E6 | **Key rotation plan** | Process exists for rotating keys if compromised | Medium |
| E7 | **Minimum permissions** | API keys scoped to minimum required permissions | Medium |

### F. Data Privacy & Compliance

| # | Check | What to look for | Severity |
|---|-------|-----------------|----------|
| F1 | **Data sent to LLM** | Document exactly what user data is sent to the LLM provider | High |
| F2 | **LLM provider DPA** | Provider has a data processing agreement (OpenAI, Anthropic, Google all do) | Medium |
| F3 | **No training on data** | Confirm API tier is "no training" (all major providers default to this for API) | High |
| F4 | **Data retention disclosure** | Privacy policy discloses that queries are processed by third-party AI | High |
| F5 | **User data deletion** | When user deletes account, all query history and data is purged | High |
| F6 | **PII in prompts** | Check if PII (names, emails, financial data) is sent to LLM — minimize where possible | Medium |

## Shared Safety Module

A reusable JavaScript module can provide drop-in protection:

### Features
- `LLMSafety` class with configurable limits
- `validateInput()` — sanitize questions, detect injection patterns
- `hardenSystemPrompt()` — wrap any system prompt with security rules
- `sanitizeOutput()` — strip leaked credentials/paths from LLM responses
- `preflightCheck()` — full pipeline: validate → rate limit → budget check
- `llmSafetyMiddleware()` — Express middleware for instant protection
- Per-user rate limiting and cost tracking built in

### Quick Integration
```javascript
import { LLMSafety, llmSafetyMiddleware } from './llm-safety.js';

const safety = new LLMSafety({
  projectName: 'MyApp',
  maxQuestionLength: 2000,
  maxCostPerQuery: 0.05,
  maxDailyBudget: 5.00,
  maxQueriesPerMinute: 10,
  allowedTopics: ['business data', 'analytics', 'reports'],
});

// Option 1: Middleware (automatic)
app.post('/api/query', llmSafetyMiddleware(safety), handler);

// Option 2: Manual (more control)
const { allowed, clean, reason } = safety.preflightCheck(userId, question);
if (!allowed) return res.status(429).json({ error: reason });
const systemPrompt = safety.hardenSystemPrompt(basePrompt);
// ... call LLM ...
const safeResponse = safety.sanitizeOutput(llmResponse);
```

## Severity Classification

| Severity | Meaning | Action |
|----------|---------|--------|
| **Critical** | Exploitable now, could leak data or drain budget | Fix immediately, block deployment |
| **High** | Significant risk, likely exploitable with effort | Fix before launch |
| **Medium** | Defense-in-depth gap, not directly exploitable | Fix within the week |
| **Low** | Best practice, minor risk | Note for improvement |

## Report Format

Output findings as:

```
## LLM Safety Audit Report — [Project Name]

### Summary
- Critical: X
- High: X
- Medium: X
- Low: X

### Findings

#### [CRITICAL] A1: System prompt not hardened
**File:** path/to/file.js:42
**Issue:** System prompt has no security instructions. LLM will follow injection attacks.
**Fix:** Add security rules using `safety.hardenSystemPrompt()` or inline SECURITY block.

#### [HIGH] D1: No per-user rate limiting on query endpoint
**File:** routes/queries.js
**Issue:** Authenticated users can send unlimited queries per minute.
**Fix:** Add `llmSafetyMiddleware(safety)` or manual rate limit check.

...

### Applied Remediations
- [x] Added system prompt security rules
- [x] Added input sanitization
- [ ] TODO: Add per-user rate limiting (needs Redis for production)
```