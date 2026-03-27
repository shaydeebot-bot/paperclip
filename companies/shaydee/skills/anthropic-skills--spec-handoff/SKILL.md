---
name: spec-handoff
description: >
  Convert product ideas, research briefs, or strategy docs into a Claude Code handoff package — a
  structured Product Spec (.docx) and optional CLAUDE.md. Trigger on "write a spec", "spec this out",
  "prepare this for Claude Code", or when a product idea needs to become an actionable build document.
---

# Spec Handoff

Turn product ideas into a handoff package that Claude Code can execute autonomously.

## Process

```
1. EXTRACT — Read all context (research, conversation, prior specs). Pull: product name, stack, ICP, pricing, MVP scope, deploy target.
2. FILL GAPS — One consolidated question pass for genuinely missing info. Apply defaults (below) silently.
3. WRITE SPEC — .docx with all sections below.
4. DELIVER — Spec + CLAUDE.md + "Read SPEC.docx and CLAUDE.md. Begin Phase 1. Work autonomously. Commit after each phase."
```

### Defaults (apply without asking)

| Decision | Default |
|----------|---------|
| Stack | Python + FastAPI + SQLite/Postgres + React + Tailwind |
| Auth | Email/password JWT (MVP); OAuth deferred to v1.1. If email/password auth exists, spec MUST include forgot-password page, reset-password page, and API endpoints for both (request reset, validate token, set new password). |
| Deploy | Railway (backend) + Vercel (frontend) |
| Email | Resend + `@react-email/components` (JSX email templates) |

## Spec Sections

Produce a `.docx` via the docx skill. Sections in this order:

**Cover/Summary Table** — Product name, stack, ICP, pricing, deploy target, auth, status. **Theme**: must explicitly state one of: "always dark", "always light", "user toggle (default: X)", or "system preference".

**1. Overview & Goals** — What it is, who it's for (2-3 sentences). MVP scope (bulleted). Post-MVP deferred. Explicit non-goals.

**2. Architecture** — Tech stack table (Layer | Technology | Version | Notes). Full directory tree as code block showing every file and folder. All component relationships. *Every dependency mentioned anywhere in the spec must appear in the tech stack table.*

**3. Database Schema** — One subsection per table: column name, type, constraints, FK relationships. Note all 1:N/N:M. *Every table must have relationships noted.* If using Supabase, include RLS policies per table. **If pricing tiers are defined, you MUST include a subscriptions/billing table** with payment provider fields (e.g., stripe_customer_id, stripe_subscription_id, plan_tier, status, current_period_end).

**4. API Endpoints** — Grouped by domain. Table: Method | Path | Description. Include auth requirement, validation rules, error cases. *Every endpoint must be specific enough that the builder won't guess behavior.*

**5. Core Business Logic** — The section that varies by product. Include actual code snippets for critical algorithms (not pseudocode). Polling, webhooks, billing, etc. **If Stripe is in the stack, include a webhook event table:** every event to handle (e.g., checkout.session.completed, customer.subscription.updated, invoice.payment_failed) with the specific database mutation for each. **Any user-facing slug or ID generation must specify:** the exact algorithm (regex), collision handling, max length, and which file implements it. **If the product supports team members or invitations**, the spec MUST include: invite table schema (token, expiry, acceptance tracking), invite acceptance flow (6 states: logged in + not member, logged in + already member, not logged in + has account, not logged in + no account, expired token, invalid token), email template for the invite, and the invite acceptance page. **If the product has user accounts**, the spec MUST include a delete-account cascade: what happens to owned resources on deletion, how shared resources are handled (transfer ownership or cascade delete), Stripe subscription cancellation (if applicable), and auth user deletion.

**6. Frontend — Key Pages** — One subsection per route: what's shown, actions available, edge cases (empty state, locked state, error state). **All marketing copy inline**: when referencing marketing pages (FAQ, pricing, landing), all copy (questions, answers, feature descriptions, CTA text) must be written in the spec, not left as TBD. **If both email/password and OAuth auth exist**, specify what the password change UI shows for OAuth-only users (hide password fields, show "signed in with [Provider]" message, etc.).

**7. Environment Variables** — Full `.env.example` as code block, grouped by service, every non-obvious var commented. *No placeholder names without context.*

**8. Build Order** — 5-7 phases, each a bulleted task list. Each phase reaches a testable state. Phase 1 always: project init + models + DB + auth. Last phase always: deploy + README. *No phase may depend on output from a later phase.*

**9. Pricing & Revenue** — Tier table with specific dollar amounts. Free tier for adoption. Revenue projections at 100/500/2K users.

**10. Key Decisions** — Decision | Rationale table. Deferred features and why. Things Claude Code should not change without asking.

**11. Credentials Setup** — Step-by-step for third-party accounts. Table: Credential | Where to get it | Phase needed. *Must cover every third-party service referenced in the spec.*

**12. File/Folder Structure** — Complete directory tree as a code block. Every file referenced in the spec must appear here. Every API route, page, component, lib file, type file, and config file — no orphan routes, no missing files. *This is the canonical file map.*

**13. OAuth Callback URL Registry** — If any OAuth flows exist, include a single table: Provider | Callback URL | Where to Register.

**14. Security Headers** — If the app loads third-party scripts (Stripe.js, analytics, fonts, CDN assets), define CSP and other security headers. List every allowed domain with justification. Specify where headers are configured (next.config.js, middleware, etc.).

**15. Deployment Config** — If cron jobs, edge functions, or custom deployment configs are needed, include the exact config file contents (e.g., `vercel.json`, `render.yaml`). Not a description — the actual file to create.

**16. Standard Error Response Envelope** — Every spec must define: the error JSON shape (e.g. `{ success: false, error: { code: "VALIDATION_ERROR", message: "...", details?: [...] } }`), a table of error codes with HTTP status mapping (e.g. VALIDATION_ERROR -> 400, UNAUTHORIZED -> 401, FORBIDDEN -> 403, NOT_FOUND -> 404, CONFLICT -> 409, RATE_LIMITED -> 429, INTERNAL -> 500), and client-side behavior per error type (toast notification, inline field error, redirect to login, retry with backoff, etc.). All API endpoints must use this envelope — no ad-hoc error shapes.

**Closing line**: "END OF SPEC — READY FOR CLAUDE CODE EXECUTION"

## CLAUDE.md (include with spec)

```markdown
# [Product Name]
[One sentence]. Full spec: SPEC.docx
## Stack
[comma-separated]
## Build Order
Follow Phase 1-N from SPEC.docx exactly. Commit after each phase (format: 'phase-N: description').
```
