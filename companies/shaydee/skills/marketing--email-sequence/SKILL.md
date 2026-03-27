---
name: marketing--email-sequence
description: >
  Design and draft multi-email nurture or onboarding sequences. Use this whenever email sequences,
  drip campaigns, onboarding flows, or lead nurture are mentioned. Trigger on "email sequence",
  "drip", "onboarding emails", "welcome series", "nurture", or "follow-up emails".
---

# Email Sequence

Design and write multi-email sequences that move subscribers through a specific journey — onboarding, nurture, re-engagement, or sales.

## Sequence Types

| Type | Goal | Typical Length |
|------|------|----------------|
| **Welcome / Onboarding** | Activate new users or subscribers | 3–7 emails over 14 days |
| **Lead Nurture** | Build trust and move toward purchase | 5–10 emails over 30 days |
| **Sales / Launch** | Drive conversions for a specific offer | 5–8 emails over 7–14 days |
| **Re-engagement** | Win back inactive subscribers | 3–5 emails over 7 days |
| **Post-purchase** | Reduce churn, drive expansion, collect testimonials | 4–6 emails over 30 days |

## Sequence Design Framework

### Step 1: Define the Journey
- Who is this for? (segment, awareness level)
- Where do they start? (new signup, lead magnet, purchase)
- Where do they need to end? (activated, converted, retained)
- What's the one action we want them to take?

### Step 2: Map the Emails
For each email, define:
- **Day**: when it sends (relative to trigger)
- **Goal**: what this email achieves in the journey
- **Subject line**: draft two options for A/B testing
- **Core message**: one idea per email
- **CTA**: one specific next action

### Step 3: Write Each Email

**Structure:**
1. **Opening hook** — first line earns the read (question, stat, story, bold claim)
2. **Body** — deliver the value or argument; short paragraphs, max 3–4 lines each
3. **Bridge** — connect the body to the CTA naturally
4. **CTA** — one clear action, specific and low-friction

**Tone principles:**
- Write to one person, not a list
- Sound like a human, not a brand
- Lead with value, not features
- Be specific — vague promises don't convert

## Email Templates

### Welcome Email (Email 1)
```
Subject: You're in — here's where to start

Hi [Name],

[One sentence: what they just joined and why it matters to them.]

Here's the single most important thing to do first:
> [Specific action with link]

[2–3 sentences on what to expect from this sequence.]

[Name]
```

### Value Email (Emails 2–N)
```
Subject: [Specific benefit or curiosity hook]

Hi [Name],

[Opening hook — story, stat, or insight]

[Core value: 2–4 short paragraphs]

[Bridge to CTA]

> [CTA — one link, one action]

[Name]
```

### Sales / Offer Email
```
Subject: [Deadline or specificity — "This closes Friday"]

Hi [Name],

[Restate the pain or desire]

[Present the offer with specifics: what, price, what's included]

[Handle the main objection]

[Urgency + CTA]

> [Buy / Start / Claim] — [deadline if applicable]

[Name]
```

## Subject Line Formulas

- **Curiosity**: "The mistake most [personas] make with [topic]"
- **Specificity**: "How [customer] got [result] in [timeframe]"
- **Question**: "Are you [doing X wrong]?"
- **Benefit**: "[Result] without [pain]"
- **Urgency**: "Last chance: [offer] closes tonight"
- **Personalization**: "[Name], your [X] is ready"

## Deliverability Checklist
- [ ] Plain text version created alongside HTML
- [ ] Unsubscribe link present
- [ ] From name is consistent with brand
- [ ] Preview text set (appears next to subject in inbox)
- [ ] Links tested
- [ ] Mobile preview checked

## Distillation Rules

These rules encode patterns that consistently improved email sequence quality across multiple evaluation iterations. Treat them as hard requirements.

### Structural Variety
1. **Vary the opening structure across emails.** Never open every email the same way (context sentence, then action, then anecdote). Use different entry points: story-first, question-first, data-first, vulnerable confession, personalized stat. A reader who gets all 5 emails must not feel a template.
2. **Testimonial emails: use narrative + blockquote hybrid.** Add a sentence of story framing before each blockquote ("Marcus owns a vintage clothing shop in Chicago. He told us he almost quit on day 6."). Pure blockquotes lose emotional arc; pure narrative loses scannability.

### Subject Lines
3. **Every subject line must be product-specific.** If the subject line could apply to any SaaS product, rewrite it. "The report that pays for itself" is generic. "Which 5 products are costing you shelf space?" is product-specific. Test by asking: could this subject line only belong to THIS product?
4. **Avoid overly narrow examples in subject lines.** If the body content applies to all users but the subject line references a specific niche (e.g., "candles"), it will alienate users outside that niche. Use the specific example in the body, keep the subject line universal.

### Copy Quality
5. **Kill AI filler phrases.** Remove: "Let's fix that right now", "Here's where it gets good", "Nothing spammy — just the parts that actually matter", "Your reason might already be sitting in your dashboard." These signal generated content. Replace with product-specific language or cut entirely.
6. **Replace vague social proof with specific numbers.** Never write "most customers" or "thousands of businesses." Use exact numbers: "the 312 shop owners who upgraded last month, 74% stayed." If the number is small, own it — specificity converts better than vagueness.
7. **Name every person in social proof.** All testimonial characters need a name, city, and business type. An unnamed "Austin bakery owner" is less credible than "Elena, who runs a bakery in Austin." Maintain this pattern across every email in the sequence.

### Technical Requirements
8. **Every email must include an unsubscribe footer.** This is a CAN-SPAM and GDPR regulatory requirement. Include an unsubscribe link and a manage-preferences link. Omitting this is a compliance failure, not a style choice.
9. **Use real merge tag syntax.** Never use generic [X] or [PLACEHOLDER] for dynamic content. Use ESP-parseable syntax: `{{products_count}}`, `{{first_name}}`, `{{days_since_signup}}`. This demonstrates production readiness.

### High-Value Additions
10. **Use P.S. lines strategically.** P.S. lines have disproportionately high read rates. Use them for: trust-building in Email 1 ("reply to this email — it comes straight to me"), referral prompts after social proof emails, or secondary feature discovery nudges. Not every email needs one — 2-3 per sequence is the sweet spot.
11. **Email 1 (welcome) needs a distinctive moment.** Generic "add your first items" onboarding reads like every SaaS welcome email. Add one vivid detail about what happens after the first action — paint the picture of the immediate payoff ("your dashboard lights up with a live stock count").
12. **Consider A/B subject line variants.** For production-ready sequences, include a B-variant subject line for each email to enable split testing.
