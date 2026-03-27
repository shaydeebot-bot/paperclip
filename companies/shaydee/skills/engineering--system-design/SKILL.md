---
name: system-design
description: >
  Design systems, services, and architectures. Covers scoping (S/M/L), architecture,
  data modeling, API contracts, infrastructure, scale/failure modes, monitoring, deployment,
  security, and backup/recovery. Use for API design, data modeling, or service boundary decisions.
---

# System Design

## Process

```
1. SCOPE  — Size the problem (S/M/L), gather requirements
2. DESIGN — Architecture, data model, APIs, infrastructure
3. VALIDATE — Trade-offs, failure modes, build order
```

## Step 1: SCOPE

Size the system before designing it. This prevents over-engineering a CRUD app or under-designing a distributed system.

| Size | Signal | Depth required |
|------|--------|---------------|
| **S** — Single service | 1 data store, <1K users, no async | Requirements + Data Model + API Contract |
| **M** — Multi-component | Multiple services, queues, caching, auth | All sections below |
| **L** — Distributed | Cross-region, high availability, >100K users | All sections + Scale + Failure modes |

### Requirements
- **Functional**: What it does (user stories or API surface)
- **Non-functional**: Scale target, latency budget, availability SLA, cost ceiling
- **Constraints**: Team size, timeline, existing stack, must-integrate-with

## Step 2: DESIGN

Fill each section that applies to the scope size.

### Architecture
Components and how they connect. Use ASCII diagram or bullet list.
- Name each component, its responsibility, and its communication pattern (REST, queue, event, direct call)
- **Decision**: For each component choice, record: `Decision | Options considered | Why this one | Trade-off accepted`

### Data Model
Tables/collections, relationships, indexes.
```
Table: users
  id (PK), email (unique), name, created_at
  Index: email

Table: orders
  id (PK), user_id (FK -> users), status, total, created_at
  Index: user_id, status
```
Note all relationships (1:1, 1:N, N:M) and which side owns the FK.

### API Contract
For each endpoint: method, path, request body, response shape, auth requirement, error cases.
```
POST /api/orders
  Auth: Bearer token (required)
  Body: { items: [{id, qty}] }
  200: { order_id, total, status }
  400: { error: "invalid_item" }
  401: { error: "unauthorized" }
```

### Infrastructure (M/L only)
- Hosting: where it runs (Vercel, Render, AWS, etc.)
- Database: managed vs self-hosted, connection pooling
- Caching: what's cached, TTL, invalidation strategy
- Queues/Events: what's async, retry policy, dead letter handling

### Scale & Failure Modes (L only)
- Load estimate: requests/sec, storage growth/month
- Scaling strategy: horizontal (stateless services) vs vertical
- Failure modes: what happens when each component goes down? What's the fallback?
- Monitoring: what metrics to alert on
- **Back-pressure**: For high-throughput systems, specify back-pressure mechanisms: How does the system signal overload? What happens when queues/streams are full? Include at least a 2-layer back-pressure strategy (e.g., rate limit at ingestion + depth check on queue + adaptive batch sizing).
- **Cascading failures**: Address cascading failure scenarios: What happens when multiple components fail simultaneously? (e.g., Redis AND database both down). Document the degradation path — what still works, what fails gracefully, what data is lost.
- **Tenant fairness**: For multi-tenant systems, specify noisy-neighbor mitigation: per-tenant resource limits, query timeouts, priority queuing, and isolation boundaries. What prevents one tenant from degrading service for all others?

### Monitoring & Observability (M/L)
- **Key metrics per component**: Define counters (requests, errors, retries), gauges (queue depth, active connections, memory), and histograms (latency percentiles, payload sizes) for each service.
- **Alert thresholds**: For each metric, specify warning and critical thresholds with severity levels (P1-P4). Include expected baseline values so alerts aren't noisy on day one.
- **Dashboard layout**: Design the on-call engineer dashboard — top row: system health summary; middle: per-service latency/error rates; bottom: infrastructure (CPU, memory, disk, queue depth).
- **Failure runbooks**: Outline the top 3 most likely failure scenarios with step-by-step investigation and remediation procedures (e.g., database connection exhaustion, queue backup, upstream API timeout).

### Deployment & Operations (M/L)
- **Deployment strategy**: Specify rolling vs blue/green deployment. For stateful services, document how in-flight requests are drained.
- **Zero-downtime migrations**: Use expand-contract pattern — add new column/table -> deploy code that writes to both -> backfill -> deploy code that reads from new -> drop old. Never run breaking schema changes in a single deploy.
- **Worker graceful shutdown**: On SIGTERM, stop accepting new work, finish in-progress jobs (with a timeout), flush buffers, then exit. Document the max shutdown window.
- **CI/CD pipeline stages**: lint -> unit test -> build -> integration test -> security scan -> staging deploy -> smoke test -> production deploy -> post-deploy health check.

### Security Incident Response (M/L)
- **Anomaly detection**: Define anomaly signals on user/device inputs — sudden spikes in API calls, unusual geolocations, impossible travel, repeated auth failures. Specify what triggers automated lockout vs alert-only.
- **Credential revocation flow**: Document the revocation procedure with an SLA target (e.g., compromised API key revoked within 15 minutes). Include: detection -> confirmation -> revocation -> re-issuance -> notification.
- **Per-entity API key scoping**: API keys must be scoped to a specific entity (user, org, service). Never issue global keys. Include rotation schedule and automated expiry.

### Backup & Recovery (M/L)
- **RPO/RTO matrix**: Define Recovery Point Objective (max data loss) and Recovery Time Objective (max downtime) for each scenario:
  - AZ failure: RPO <= 0 (synchronous replication), RTO <= 5 min (automatic failover)
  - Region failure: RPO <= 1 min (async replication), RTO <= 30 min (manual failover)
  - Data corruption: RPO = last clean backup, RTO <= 1 hour (restore from snapshot)
  - Accidental deletion: RPO <= 0 (soft-delete + retention window), RTO <= 15 min
- **Tested restore procedure**: Document the exact restore steps and test them on a cadence (monthly for critical data, quarterly for cold backups). Record last successful test date.

## Step 3: VALIDATE

Before handing off to implementation:

1. **Trade-off table**: List every architectural decision with what you traded away
2. **MVP cut**: What's the minimum that delivers value? What can be added later?
3. **Build order**: Numbered list of what to implement first -> last
4. **Revisit triggers**: "When [condition], reconsider [decision]" — e.g., "When >10K users, reconsider SQLite -> Postgres"