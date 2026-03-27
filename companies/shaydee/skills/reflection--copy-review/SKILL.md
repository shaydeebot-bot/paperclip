---
name: reflection--copy-review
description: >
  Structured methodology for reflecting on marketing copy quality. Catches AI slop, brand voice drift,
  weak conversion copy, and accuracy mismatches. Use after any copywriting pass to audit quality before
  the copy goes into production or gets published.
---

# Reflection: Copy Review

## Purpose
Structured methodology for reflecting on marketing copy quality. Catches AI slop, brand voice drift, weak conversion copy, and accuracy mismatches. Designed to produce scores that feed the eval system for skill improvement.

## Methodology

### Step 1: AI Slop Scan (Do This FIRST)
Before reading for meaning, scan mechanically for AI tells. This is the #1 quality killer.

**Automated scan — grep the copy for these patterns:**
```
game.changer|revolutioniz|unlock the power|fast-paced world|seamlessly|
effortlessly|robust|cutting-edge|state-of-the-art|leverage (verb)|
empower|supercharge|next level|whether you're a|say goodbye|
it's not just|in a world where|introducing|dive in|streamline|
elevate your|transform your|comprehensive solution|holistic|
synergy|paradigm|disrupt|innovative solution|best-in-class
```

**Each hit = evidence.** Quote the exact line. Provide a specific replacement that sounds human.

### Step 2: Brand Voice Check
Pull up the brand voice guide side-by-side with the copy:
- Read the 3-5 voice adjectives. Does the copy FEEL like those adjectives?
- Check "words to use" — are they actually used?
- Check "words to avoid" — are any present?
- Read 3 paragraphs aloud (mentally). Does it sound like one person wrote it, or a committee?

### Step 3: Conversion Analysis
For each CTA or conversion point:
1. **What's the ask?** (sign up, buy, click, etc.)
2. **What's the benefit stated within 5 words of the CTA?**
3. **Is there friction reduction?** (free trial, no credit card, takes 30 seconds)
4. **Would YOU click this?** Be honest.

**Headline test:** Cover everything except the headline. Does it make you want to read more? If not, it fails.

### Step 4: Accuracy Verification
Cross-reference copy claims against the spec:
- If copy says "AI-powered" — is there actually an AI component in the spec?
- If copy says "instant" — is the response actually fast?
- If copy mentions specific features — are they in the spec?
- If copy states pricing — does it match the pricing doc?

### Step 5: Pattern Recognition
After scoring, identify:
- Does the copy have a consistent "voice" or does every section sound different?
- Are there recurring weak patterns? (e.g., "always starts with 'Introducing...'")
- Does the copy understand the ICP or is it generic?
- Is there a skill that could help? (e.g., brand-voice skill not being used effectively)

## The Rewrite Standard

When providing rewrites, follow these rules:

1. **Match the brand voice.** Don't replace the original voice with your own.
2. **Be specific to THIS product.** Generic rewrites are as bad as generic originals.
3. **Shorter is almost always better.** If the original is 3 sentences, try to rewrite in 1-2.
4. **Lead with the benefit, not the feature.** "Save 2 hours a week" > "Our automated system..."
5. **Use concrete numbers when possible.** "Join 1,200 teams" > "Join thousands of teams"

## Anti-Patterns (Don't Do This)
- **Being too nice:** "The copy is mostly good with some areas for improvement" — NO. Score honestly and cite evidence.
- **Rewriting everything:** Only rewrite what scored below threshold. Good copy should stay.
- **Imposing YOUR style:** You're checking against the BRAND voice, not your preferences.
- **Ignoring SEO:** Meta descriptions over 160 chars get truncated. Titles over 60 chars get cut. These are hard limits.

## Output Format
Your output MUST include:
1. Scores table with evidence for each score
2. Every AI slop instance found with exact quote and replacement
3. Rewrites for sections scoring below threshold
4. "What Was Done Well" section (mandatory)
5. Specific action items if score < 80%