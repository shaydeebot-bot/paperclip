---
name: architecture
description: >
  Create and evaluate Architecture Decision Records (ADRs) and architectural designs.
  Use whenever a significant technical choice is being made — technology selection,
  system structure, or structural tradeoffs. Documents decisions and reasoning for future reference.
---

# Architecture

Systematic approach to architectural decisions and documentation via Architecture Decision Records (ADRs).

## When to Write an ADR

Write an ADR when:
- Choosing between two or more technologies or approaches with real trade-offs
- Making a decision that's hard to reverse (database choice, auth strategy, monorepo vs. polyrepo)
- A decision will affect multiple team members or agents
- You want to capture *why* a decision was made, not just what was decided

## ADR Format

```markdown
# ADR-[NNN]: [Short descriptive title]

**Date:** YYYY-MM-DD
**Status:** Proposed | Accepted | Deprecated | Superseded by ADR-NNN

## Context
What is the situation forcing this decision? What constraints apply?
What have we already decided that limits our options?

## Options Considered

### Option A: [Name]
**Pros:** ...
**Cons:** ...
**Risk:** Low / Medium / High

### Option B: [Name]
**Pros:** ...
**Cons:** ...
**Risk:** Low / Medium / High

## Decision
We will use **[Option X]** because [one clear reason].

## Consequences
- What becomes easier
- What becomes harder
- What we give up
- Follow-up decisions triggered by this one
```

## Architectural Analysis Framework

When evaluating a design or technology choice, assess across these dimensions:

| Dimension | Questions to ask |
|-----------|-----------------|
| **Correctness** | Does it solve the actual problem? Does it handle edge cases? |
| **Simplicity** | Is this the simplest thing that works? What complexity does it add? |
| **Scalability** | What are the limits? When will we need to revisit? |
| **Operability** | How hard is it to deploy, monitor, debug, and roll back? |
| **Security** | What attack surface does this introduce? What data does it touch? |
| **Cost** | Infrastructure, licensing, and engineering time to maintain |
| **Team fit** | Does the team have the skills? Good tooling and community? |

## Common Architectural Patterns

| Pattern | Use When |
|---------|----------|
| Monolith | Early stage, small team, unclear domain boundaries |
| Microservices | High scale, independent deployment needs, large teams |
| Modular monolith | Monolith with enforced module boundaries — best of both |
| Event-driven | Async workflows, audit trails, fan-out to multiple consumers |
| BFF (Backend for Frontend) | Mobile + web have very different data needs |
| CQRS | Read/write ratio is very asymmetric |
| Hexagonal (Ports & Adapters) | When you need to swap infrastructure (DB, queue, etc.) |

## Output

Produce an ADR document (or a short decision matrix for minor choices) and save it to `docs/adr/` or a decisions directory. Reference it in project documentation when relevant.