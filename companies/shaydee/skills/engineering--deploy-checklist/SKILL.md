---
name: deploy-checklist
description: >
  Pre-deployment verification checklist before pushing to production. Run before every
  deployment — even small changes or hotfixes. Covers code quality, environment config,
  database migrations, dependencies, security, observability, and rollback planning.
---

# Deploy Checklist

Run this before every production deployment. Catch problems before users do.

## Pre-Deploy Checklist

### Code Quality
- [ ] All tests pass (`npm test` / `pytest` / equivalent)
- [ ] No linting errors
- [ ] No `console.log`, `debugger`, `TODO: remove`, or temporary hacks left in
- [ ] No hardcoded credentials, API keys, or secrets in code
- [ ] Code reviewed (or self-reviewed if solo)

### Environment & Config
- [ ] All required environment variables are set in the target environment
- [ ] Environment variables are **not** committed to git
- [ ] `.env.example` is up to date if new vars were added
- [ ] Feature flags / toggles are set correctly for prod
- [ ] External service URLs point to production endpoints (not staging/sandbox)

### Database & Data
- [ ] Database migrations are written and tested
- [ ] Migrations are backwards-compatible (old code can still run against new schema)
- [ ] No destructive migrations (DROP TABLE, DELETE without WHERE) without a confirmed backup
- [ ] Seed data or defaults are set correctly for new columns

### Dependencies
- [ ] `package-lock.json` / `requirements.txt` committed and up to date
- [ ] No known Critical or High CVEs (`npm audit` / `pip audit`)
- [ ] No packages pinned to git SHAs or private forks without documentation

### Security
- [ ] New endpoints have authentication/authorization checks
- [ ] User input is validated and sanitized
- [ ] No new CORS rules that are overly permissive
- [ ] Rate limiting is in place for public-facing endpoints

### Observability
- [ ] Errors are being logged (not silently swallowed)
- [ ] Key actions emit logs or events that can be monitored
- [ ] Alerts or dashboards updated if new services were added

### Rollback Plan
- [ ] Know how to roll back: previous Docker image, git revert, or feature flag off
- [ ] Database migrations are reversible (or a rollback migration exists)
- [ ] Downtime window communicated if needed

## Post-Deploy Checks (first 15 minutes)
- [ ] Smoke test the critical user path manually
- [ ] Check error rate in logs — no spike vs. baseline
- [ ] Check response times — no regression
- [ ] Confirm new feature works end-to-end in production

## Go / No-Go

**Go** if all checklist items pass.

**No-Go** if: failing tests, missing env vars, destructive migration without backup, or critical CVEs unpatched.

When in doubt, deploy to staging first and validate there before promoting to production.