---
name: scout--autoresearch
description: >
  General-purpose iterative research loop modeled on autonomous experiment systems. Generates
  hypotheses, evaluates them against user-defined criteria, keeps winners, discards losers, injects
  new angles, and loops until the top N answers converge. Use for market sizing, technology
  evaluation, vendor selection, trend analysis, or any open-ended inquiry needing systematic
  exploration rather than a single-pass answer.
---

# AutoResearch — Iterative Research Loop

Treat every research question like an ML experiment: generate candidates, evaluate against a fixed metric, keep improvements, discard regressions, inject fresh angles, loop until convergence.

```
AUTORESEARCH

1. FRAME   — Question + rubric + scope (one-time)
2. SEARCH  — Baseline known + broad search for new
3. EVALUATE — Score, rank, prune (keep/discard)
4. DEEPEN  — Research survivors, inject new angles
5. CHECK   — Top N stable 2 iterations? -> output
     |— NO -> loop to step 3

EARLY EXIT: top N lead by 15+ points -> output now
HARD STOP: max_iterations (default 6)
FAST MODE: --fast -> 5 candidates, 3 iterations, brief
```

## Rules

1. **Baseline first.** Score what's already known before searching. Your first evaluation is iteration 0.
2. **Keep or discard.** Every candidate either improves your pool or gets cut. No maybe pile.
3. **Never stop until convergence.** Run autonomously. Do not ask the user if you should continue. If stuck, combine near-misses from the pruning log, search contrarian sources, or re-read the question from a different persona.
4. **Simplicity wins.** A candidate needing 10 caveats is worse than one that clearly fits. Eliminating an entire category is as valuable as finding a winner.
5. **Crash recovery.** Dead-end research path? Log it, skip it, move on. Don't burn budget on broken paths.
6. **Log every decision.** Every keep/drop/inject gets a one-line reason.
7. **Fight anchoring.** Your first instinct is probably wrong. Score baseline candidates provisionally, then re-score AFTER broad search reveals the actual landscape. The first result you find is not the best — it's the most obvious.
8. **Resolve unknowns fast.** If 3+ criteria are scored `?` for any candidate, you MUST search before the next EVALUATE. Don't carry unknowns across iterations.

---

## Step 1: FRAME

Do this once at the start. This is the ONE place you may confirm with the user. After this, the loop runs autonomously.

### Define
- **Research question**: one sentence.
- **Primary metric**: the single measure that determines "better" (e.g., "fit score, higher is better").
- **Scope**: what's in-bounds, what's excluded, any dealbreakers that instantly disqualify.
- **Top N**: how many winners (default 3). **Depth**: brief / standard / deep.

### Scoring Rubric
4-6 weighted criteria. For each, state what 1 (bad), 5 (ok), and 10 (great) look like. This rubric is your evaluation harness — it does not change during the loop.

| Criterion | Weight (1-3x) | Scoring guide (1 / 5 / 10) |
|-----------|---------------|----------------------------|
| *infer from question or use user-provided* | | |

If the user doesn't provide criteria, infer reasonable ones, propose with guides, and start.

---

## Step 2: SEARCH

### Baseline (iteration 0)
List 3-5 candidates already known: user's current choice, market leader, anything mentioned in conversation. Score them against the rubric. This establishes the reference point.

### Broad search
Run **6-10 web searches in parallel**, varying angle:

| Angle | Pattern |
|-------|---------|
| Direct | "[topic] best 2026", "[topic] top rated comparison" |
| Challenger | "[topic] alternatives to [known leader]" |
| Community | "[topic] Reddit", "[topic] Hacker News recommendations" |
| Contrarian | "why [leader] is bad", "[topic] overrated" |
| Adjacent | Related spaces that might surface unexpected candidates |

**Per search**: extract 3-5 factual claims with the specific source URL. Don't just skim snippets — pull concrete data points (pricing, features, user counts, sentiment).

Target: **8-15 candidates** total (baseline + new). For each, capture: name, one-line summary, source (with date), and why it was included.

---

## Step 3: EVALUATE

### Score
**Re-read your scoring guide before every EVALUATE phase.** Rubric drift is real — what "7" meant in iteration 1 must still mean "7" in iteration 4. The rubric is your fixed evaluation harness.

Evaluate every candidate against the rubric. Score each criterion 1-10 using the guide, multiply by weight, sum, normalize to 0-100. If data is insufficient, mark `?` — resolved in DEEPEN. Don't guess.

### Rank
Sort by composite score. Produce the results table:

```
| Rank | Candidate | Score | C1 | C2 | ... | Delta | Status |
|------|-----------|-------|----|----| --- |-------|--------|
| 1    | ...       | 82    | 9  | 7  |     | —     | NEW    |
```

**Delta**: change from prior iteration. **Status**: `NEW` / `KEPT` / `PROMOTED` (+10) / `DROPPING` / `INJECTED` / `BASELINE`.

### Prune
| Rule | Action |
|------|--------|
| Score < 40 | **DROP** |
| Declined 2 iterations in a row | **DROP** |
| Bottom 50% AND score < 55 | **DROP** |
| 3+ criteria still `?` after DEEPEN | **DROP** |
| Score jumped 10+ | **PROMOTE** |

One-line reason for every drop. This log feeds re-injection if you get stuck later.

---

## Step 4: DEEPEN + INJECT

### Deepen survivors
For surviving candidates (especially those with `?` scores), run **max 3 targeted searches per candidate**:
- Primary sources: official site, docs, pricing, changelogs
- Social proof: G2, Reddit, HN, Twitter/X sentiment
- Signals: recent funding, acquisitions, product launches, competitive positioning

Re-score any criteria affected by new data.

### Inject new candidates
Add **2-4 new candidates** from unexplored angles each iteration:
- Adjacent categories, different geographies, emerging entrants (last 6 months)
- Contrarian: what people switch to when they leave the leader
- **Combine near-misses**: review pruning log for candidates that were strong on different criteria — search for something that combines those strengths

New candidates enter at EVALUATE (step 3) next iteration.

---

## Step 5: CONVERGENCE CHECK

**Converged**: same N candidates hold top N for 2 consecutive iterations — proceed to output.

**Early exit**: if top N lead the next-best by 15+ points after any iteration — output now. Don't force iterations when the answer is clear.

**Not converged**: loop back to step 3.

**Max iterations reached**: force output with current top N, note convergence was not achieved.

**Stuck** (no movement, injection not surfacing new candidates): review pruning log for data-dropped (not score-dropped) candidates, re-admit up to 3 with fresh search angles. If still stuck after one more iteration, force output.

---

## Iteration Log

After each iteration, output the cumulative results table:

```
| Iter | Candidate | Score | Delta | Status | Reason |
|------|-----------|-------|-------|--------|--------|
| 0 | Known Leader | 65 | — | BASELINE | Market leader, weak on pricing |
| 1 | Challenger A | 78 | NEW | KEPT | Strong community signal |
| 1 | Known Leader | 62 | -3 | DROPPING | Pricing confirmed worse |
| 2 | Challenger A | 82 | +4 | PROMOTED | Deep research confirmed |
```

---

## Final Output

**Progressive disclosure: lead with the decision, details follow for those who want them.**

### 1. Decision table (read in 30 seconds)

```
| Rank | Winner | Score | One-line verdict | Next action |
|------|--------|-------|-----------------|-------------|
| 1 | [Name] | 82 | [Why in <=10 words] | [What to do now] |
| 2 | [Name] | 75 | ... | ... |
| 3 | [Name] | 68 | ... | ... |
```

**Every winner gets a "Next action"** — what should the user DO with this information? Not just "this is good" but "sign up for the free trial", "schedule a demo", "read their API docs at [url]", etc.

### 2. Winner profiles (scaled to depth)

**Brief**: 2-3 sentences + source confidence (High/Medium/Low).

**Standard**:
```
### [Rank]. [Name] — [Score]/100
**Why it ranks**: [strengths mapped to criteria]
**Watch out for**: [weaknesses]
**Best for**: [ideal use case]
**vs alternatives**: [positioning]
**Next action**: [specific, concrete step]
```

**Deep**: Full profile with all DEEPEN research, per-criterion scoring breakdown, all sources with dates.

### 3. Supporting detail

**Comparison Matrix** (side-by-side on all criteria), **Honorable Mentions** (near-misses worth watching), **Experiment Log** (full iteration history with keep/drop reasons), **Autonomous Decisions** (judgment calls made without user input).

### 4. Session metadata

```
AutoResearch: [Question] | autoresearch/[topic]-[date]
Iterations: [N] (converged: yes/no) | Candidates: [total unique] | Baseline->Best: [delta]
```

---

## FAST Mode

For simple questions where speed matters more than exhaustiveness:

`--fast "question"`

- 5 candidates max, 3 iterations max, brief output
- Skip baseline if no known candidates
- Early exit after iteration 1 if clear winner (10+ point lead)
- No injection phase — evaluate what you find, converge or force output

---

## Defaults

| Parameter | Default |
|-----------|---------|
| max_iterations | 6 (FAST: 3) |
| convergence_threshold | 2 stable iterations |
| candidates | 8-15 (FAST: 5) |
| inject per iteration | 2-4 |
| prune threshold | 40 |
| top N | 3 |
| depth | standard (FAST: brief) |
| searches per DEEPEN | max 3 per candidate |

---

## Failure Recovery

| Failure | Action |
|---------|--------|
| Dead-end search / paywall | Log, skip, try adjacent query |
| Contradictory sources | Note conflict, score both, triangulate in DEEPEN |
| Candidate shut down / acquired | DROP, inject replacement |
| All candidates score similarly | Add differentiating criterion, or acknowledge commodity market |
| Out of injection ideas | Re-read question as a different persona (buyer, builder, investor, critic), search different geography or abstraction level |