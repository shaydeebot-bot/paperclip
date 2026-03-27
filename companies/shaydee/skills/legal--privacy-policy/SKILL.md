---
name: legal--privacy-policy
description: >
  Generate a comprehensive, jurisdiction-aware privacy policy tailored to the actual product. Always read the codebase first to understand what data is actually collected before writing the policy.
---

# Privacy Policy Generator

Generate a comprehensive, jurisdiction-aware privacy policy tailored to the actual product.

## When to Use

When generating or reviewing a privacy policy for a product. Always read the codebase first to understand what data is actually collected.

## Process

1. **Audit data collection** — Read the database schema, API routes, and frontend forms to identify every piece of personal data collected
2. **Identify third parties** — Find all external services the product sends data to (analytics, email, payments, APIs)
3. **Check cookies** — Identify all cookies set by the product (name, purpose, duration, type)
4. **Map data flows** — How data moves: collection → storage → processing → sharing → deletion
5. **Generate policy** — Write a privacy policy covering all of the above

## Required Sections

1. **Introduction** — Who operates the product, what this policy covers
2. **Information We Collect** — Categorized: provided directly, collected automatically, from third parties
3. **How We Use Your Information** — Purpose for each data type
4. **How We Share Your Information** — Third parties, legal requirements, business transfers
5. **Cookies and Tracking** — Types, purposes, how to control
6. **Data Retention** — How long each data type is kept
7. **Your Rights** — GDPR rights (access, rectification, erasure, portability, objection), CCPA rights (know, delete, opt-out, non-discrimination)
8. **Data Security** — Measures taken (encryption, hashing, access controls)
9. **International Transfers** — Where data is stored/processed
10. **Children's Privacy** — COPPA compliance statement
11. **Changes to This Policy** — How users are notified
12. **Contact** — How to reach the data controller/DPO

## Rules

- Use plain language, not legalese
- Be specific — reference actual data fields, not vague categories
- Mark unknowns with `[PLACEHOLDER: ...]`
- Include "Last updated" date
- Make it scannable with clear headings