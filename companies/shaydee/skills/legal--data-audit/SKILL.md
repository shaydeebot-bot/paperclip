---
name: legal--data-audit
description: >
  Audit a codebase to map all personal data collection, storage, processing, and sharing. Run before generating any legal documents — this audit provides the factual basis for privacy policies, cookie policies, and compliance assessments.
---

# Data Audit

Audit a codebase to map all personal data collection, storage, processing, and sharing.

## When to Use

Before generating any legal documents. This audit provides the factual basis for privacy policies, cookie policies, and compliance assessments.

## Process

1. **Database schema** — Read all table definitions, identify PII fields (email, name, IP, location, payment info)
2. **API routes** — Find all endpoints that accept user input or return user data
3. **Frontend forms** — Find all forms that collect user information
4. **Cookies & storage** — Find all cookie/localStorage/sessionStorage usage
5. **Third-party services** — Find all external API calls, SDKs, or services that receive data
6. **Data processing** — Find any data transformation, aggregation, or analysis
7. **Data retention** — Check for data deletion mechanisms, TTLs, or archival
8. **Security measures** — Check for encryption, hashing, access controls, HTTPS

## Output Format

```markdown
## Data Audit Report

### Personal Data Collected
| Field | Source | Storage | Encrypted/Hashed | Retention |
|-------|--------|---------|------------------|-----------|
| email | Signup form | users.email | No (plaintext) | Until account deletion |
| password | Signup form | users.password_hash | Yes (bcrypt) | Until account deletion |
| IP address | Click tracking | clicks.ip | Yes (SHA-256) | Indefinite |

### Cookies Set
| Name | Set By | Purpose | Duration | Contains PII |
|------|--------|---------|----------|-------------|

### Third-Party Data Sharing
| Service | Data Sent | Purpose | DPA Required |
|---------|-----------|---------|-------------|

### Data Subject Rights Implementation
- [ ] Right to access (data export)
- [ ] Right to erasure (account deletion)
- [ ] Right to rectification (profile editing)
- [ ] Right to portability (data download)
- [ ] Right to object (opt-out mechanisms)

### Security Assessment
- [ ] Passwords hashed (bcrypt/argon2)
- [ ] PII encrypted at rest
- [ ] HTTPS enforced
- [ ] Rate limiting on auth endpoints
- [ ] Input validation/sanitization
- [ ] SQL injection prevention
- [ ] XSS prevention
```

## Quick Grep Patterns

Use these to quickly locate data touchpoints in the codebase:

```bash
# Database schema / models
grep -rn "CREATE TABLE\|Schema(\|model\|schema\|\.define(" --include="*.js" --include="*.ts" --include="*.sql"

# User input collection (forms and API)
grep -rn "req\.body\|request\.body\|formData\|type=\"email\"\|type=\"password\"" --include="*.js" --include="*.html"

# Cookies
grep -rn "cookie\|setCookie\|Set-Cookie\|express-session\|cookie-parser\|localStorage\|sessionStorage" --include="*.js"

# Third-party API calls
grep -rn "fetch(\|axios\.\|\.post(\|\.get(" --include="*.js" --include="*.ts" | grep -v node_modules

# Auth and secrets
grep -rn "jwt\|jsonwebtoken\|passport\|bcrypt\|hash\|session\|Bearer" --include="*.js"

# Console logging of user data (exposure risk)
grep -rn "console\.log.*req\.\|console\.log.*user\|console\.log.*email\|console\.log.*password" --include="*.js"
```

## Rules

- Be exhaustive — miss nothing
- Reference exact file paths and line numbers
- Flag any PII stored in plaintext
- Flag any data shared without explicit user consent