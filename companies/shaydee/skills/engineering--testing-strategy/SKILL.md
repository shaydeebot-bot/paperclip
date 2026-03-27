---
name: testing-strategy
description: >
  Design test strategies and test plans. Covers the testing pyramid, strategy by component type,
  coverage guidance, and minimum viable test examples. Use when deciding what to test, how to
  test it, or when designing coverage for a new feature or system.
---

# Testing Strategy

Design effective testing strategies balancing coverage, speed, and maintenance.

## Testing Pyramid

```
        /  E2E  \         Few, slow, high confidence
       / Integration \     Some, medium speed
      /    Unit Tests  \   Many, fast, focused
```

## Strategy by Component Type

- **API endpoints**: Unit tests for business logic, integration tests for HTTP layer, contract tests for consumers
- **Data pipelines**: Input validation, transformation correctness, idempotency tests
- **Frontend**: Component tests, interaction tests, visual regression, accessibility
- **Infrastructure**: Smoke tests, chaos engineering, load tests

## What to Cover

Focus on: business-critical paths, error handling, edge cases, security boundaries, data integrity.

Skip: trivial getters/setters, framework code, one-off scripts.

## Minimum Viable Tests

At minimum, write:
1. **One test per API endpoint** — does it return the expected status code and response shape?
2. **One test per page route** — does the route resolve (not 404)?
3. **One test for the critical user path** — can a user complete the main action (signup, create, submit)?

**Example smoke test structure (Express/Node):**
```javascript
import { describe, it } from 'node:test';
import assert from 'node:assert';

describe('API smoke tests', () => {
  it('GET / returns 200', async () => {
    const res = await fetch('http://localhost:3000/');
    assert.strictEqual(res.status, 200);
  });

  it('POST /api/create returns 201 with valid data', async () => {
    const res = await fetch('http://localhost:3000/api/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'test' }),
    });
    assert.strictEqual(res.status, 201);
  });
});
```

## Output

Produce a test plan with: what to test, test type for each area, coverage targets, and example test cases. Identify gaps in existing coverage.