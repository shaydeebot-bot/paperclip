---
name: reflection--project-review
description: >
  Structured methodology for reviewing entire project output as a coherent product. Catches where
  different contributors contradict, duplicate, or miss each other's output. Produces final quality
  scores. Use after all build and review passes are complete, before shipping.
---

# Reflection: Project Review

## Purpose
Structured methodology for reviewing the entire project output as a coherent product. Individual contributors produce good work in isolation — this skill catches where they contradict, duplicate, or miss each other's output. Also produces the final quality scores that feed the eval system.

## Methodology

### Step 1: Collect All Scores
Gather review scores from prior reviewers:
- Code review scores
- Copy review scores
- Security review status
- QA/verification status

These feed into your overall assessment — don't re-score what's already been scored.

### Step 2: Cross-Contributor Coherence Audit
This is your PRIMARY job. Check each pair:

| Check | What to compare |
|-------|----------------|
| Spec vs Code | Does the code implement what the spec says? |
| Copy vs Code | Is the marketing copy actually in the built product? |
| Copy vs Spec | Does the copy describe the real product? |
| FAQ vs Code | Do FAQ answers match actual product behavior? |
| Legal vs Code | Does the privacy policy reference actual data collected? |
| Legal vs Security | Are security findings addressed in legal docs? |
| Launch Marketing vs Code | Does launch marketing describe what was actually built? |
| Pricing | Consistent across: spec, landing page, marketing? |
| Product Name | Spelled/styled the same everywhere? |

### Step 3: User Journey Walkthrough
Open the built HTML/code and walk through as a user:

1. **First 5 seconds:** What do I see? Do I understand the product?
2. **Hero section:** Is the headline compelling? Is the CTA obvious?
3. **Scroll down:** Does the story flow logically?
4. **Click CTA:** What happens? Is the next step clear?
5. **Error state:** What if something goes wrong?
6. **Mobile:** Resize to 375px. Does it still work?
7. **Footer:** Are legal links present? Do they work?
8. **Help/FAQ:** Can I find it? Are answers accurate?

Document each step with observations.

### Step 4: Completeness Checklist
Go through this checklist for EVERY product:

**Pages:**
- [ ] Landing/home page
- [ ] Core product page(s)
- [ ] Privacy policy
- [ ] Terms of service
- [ ] Cookie policy (if cookies used)
- [ ] FAQ or Help page
- [ ] 404 page

**Technical:**
- [ ] Favicon set
- [ ] Meta title on every page
- [ ] Meta description on every page
- [ ] OG tags (og:title, og:description, og:image)
- [ ] Responsive design (mobile-first)
- [ ] HTTPS-ready (no hardcoded http:// links)

**Legal:**
- [ ] Cookie consent banner (if cookies used)
- [ ] Footer links to privacy, terms on ALL pages
- [ ] No false claims in marketing copy

**Accessibility:**
- [ ] Color not sole indicator (colorblind user!)
- [ ] Alt text on images
- [ ] Semantic headings (h1 -> h2 -> h3)
- [ ] Form labels present
- [ ] Keyboard navigable

### Step 5: Generate Scores JSON
Produce a machine-readable `scores.json` for the eval system:

```json
{
  "run_id": "<run-id>",
  "timestamp": "<ISO 8601>",
  "contributors": {
    "spec": { "delivered": true, "quality": "strong|adequate|weak", "notes": "" },
    "copy_pass_1": { "delivered": true, "quality": "strong|adequate|weak", "notes": "" },
    "code": { "delivered": true, "quality": "strong|adequate|weak", "notes": "" },
    "verification": { "delivered": true, "result": "pass|fail" },
    "security": { "delivered": true, "result": "clean|issues-found" },
    "support_docs": { "delivered": true, "quality": "strong|adequate|weak", "notes": "" },
    "legal": { "delivered": true, "quality": "strong|adequate|weak", "notes": "" },
    "code_pass_2": { "delivered": true, "quality": "strong|adequate|weak", "notes": "" },
    "copy_pass_2": { "delivered": true, "quality": "strong|adequate|weak", "notes": "" }
  },
  "reflection_scores": {
    "code": { "spec": 0, "copy": 0, "quality": 0, "security": 0, "ux": 0, "total": 0 },
    "copy_p1": { "slop": 0, "voice": 0, "conversion": 0, "accuracy": 0, "seo": 0, "total": 0 },
    "copy_p2": { "slop": 0, "voice": 0, "conversion": 0, "accuracy": 0, "seo": 0, "total": 0 },
    "project": { "coherence": 0, "completeness": 0, "journey": 0, "brand": 0, "launch": 0, "total": 0 }
  },
  "overall_score": 0,
  "recurring_patterns": [],
  "skill_gaps": [],
  "recommended_skill_improvements": []
}
```

### Step 6: Cross-Run Analysis (if prior runs exist)
If `scores.json` files exist from previous runs:
1. Compare scores across runs
2. Identify trending weaknesses (same category low across runs)
3. Identify improvements (categories that got better)
4. Flag persistent patterns — these are candidates for skill improvements

## Anti-Patterns
- **Skipping the user journey walkthrough.** Reading summaries is not the same as testing the product. Open the files.
- **Scoring based on output summary quality, not product quality.** A beautifully written summary means nothing if the actual code is broken.
- **Ignoring cross-contributor contradictions.** This is your #1 value-add. If you don't check coherence, no one will.
- **Not producing scores.json.** The eval system depends on it for cross-run analysis.

## Output Format
Your output MUST include:
1. All scores with evidence
2. Coherence gap analysis
3. User journey walkthrough
4. Completeness checklist (checked/unchecked)
5. `scores.json` written to the run output directory
6. Contributor performance summary table
7. Cross-run patterns (if prior data exists)