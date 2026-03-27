---
name: legal--cookie-policy
description: >
  Generate a cookie policy and cookie consent banner code tailored to the actual cookies a product sets. Use when generating cookie policies or implementing cookie consent. Always read the codebase to find every cookie set by the product.
---

# Cookie Policy & Consent Generator

Generate a cookie policy and cookie consent banner code tailored to the actual cookies the product sets.

## When to Use

When generating cookie policies or implementing cookie consent. Always read the codebase to find every cookie set by the product.

## Process

1. **Scan for cookies** — Search codebase for `res.cookie`, `document.cookie`, `Set-Cookie`, `localStorage`, `sessionStorage`
2. **Categorize** — Essential (auth, security), Functional (preferences), Analytics, Marketing/Tracking
3. **Document each cookie** — Name, purpose, duration, type (first-party/third-party), category
4. **Generate policy** — Cookie-by-cookie disclosure
5. **Generate consent banner** — HTML/CSS/JS for cookie consent with accept/reject

## Cookie Table Format

| Cookie Name | Purpose | Duration | Type | Category |
|-------------|---------|----------|------|----------|
| `ss_token` | Authentication | 7 days | First-party | Essential |
| `ss_click_*` | Affiliate attribution | Variable | First-party | Marketing |

## Consent Banner Requirements

- Must appear on first visit before non-essential cookies are set
- Must allow granular control (accept all, reject all, customize by category)
- Must remember consent choice
- Must be dismissible
- Must link to full cookie policy
- Essential cookies don't need consent (but must be disclosed)

## Output

1. Full cookie policy page content
2. Cookie consent banner HTML/CSS/JS snippet
3. List of cookies by category for the consent manager