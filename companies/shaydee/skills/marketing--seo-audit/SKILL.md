---
name: marketing--seo-audit
description: >
  Keyword research, on-page analysis, content gap identification, and technical SEO checks. Use
  any time SEO improvement is discussed — even for one page or one keyword. Trigger on "SEO",
  "search rankings", "organic traffic", "keywords", "Google", "content gaps", or "why isn't our site showing up".
---

# SEO Audit

Systematic audit covering keyword strategy, on-page optimization, content gaps, and technical health.

## Audit Scope

### 1. Keyword Research

**Seed keyword generation:**
- Brand terms (product name, company name)
- Problem-aware terms ("[problem] solution", "how to fix [problem]")
- Product-aware terms ("[category] software", "best [category] tools")
- Competitor terms ("[competitor] alternative", "[competitor] vs")

**Keyword evaluation criteria:**

| Metric | What to look for |
|--------|-----------------|
| Search volume | >100/mo for niche, >1K for mainstream targets |
| Keyword difficulty | Target KD <40 for new sites, <60 for established |
| Intent | Match intent (informational, commercial, transactional) |
| Relevance | Directly tied to product or audience problem |

**Priority matrix:**

| | High Volume | Low Volume |
|--|------------|-----------|
| **Low Difficulty** | Quick wins — target now | Long tail — use in content |
| **High Difficulty** | Long-term — build authority | Skip unless brand-critical |

### 2. On-Page Analysis

For each key page, check:

**Title tag:**
- [ ] Contains primary keyword
- [ ] 50–60 characters
- [ ] Unique across the site
- [ ] Includes brand name (usually at end)

**Meta description:**
- [ ] Contains primary keyword naturally
- [ ] 150–160 characters
- [ ] Has a CTA or value hook
- [ ] Unique across the site

**Headings:**
- [ ] H1 contains primary keyword, used once per page
- [ ] H2s cover related subtopics and secondary keywords
- [ ] Heading hierarchy is logical (H1 > H2 > H3)

**Content:**
- [ ] Primary keyword in first 100 words
- [ ] 800+ words for informational pages
- [ ] Internal links to related pages
- [ ] External links to authoritative sources
- [ ] Images have descriptive alt text

**URL:**
- [ ] Short and descriptive
- [ ] Contains keyword
- [ ] Hyphens not underscores

### 3. Technical SEO

**Crawlability:**
- [ ] `robots.txt` is not blocking important pages
- [ ] XML sitemap exists and is submitted to Google Search Console
- [ ] No orphan pages (pages with zero internal links)
- [ ] Canonical tags are set correctly

**Performance:**
- [ ] Core Web Vitals pass (LCP <2.5s, FID <100ms, CLS <0.1)
- [ ] Mobile-friendly
- [ ] HTTPS on all pages
- [ ] No redirect chains (A>B>C — fix to A>C)

**Structured data:**
- [ ] Organization schema on homepage
- [ ] Article schema on blog posts
- [ ] Product schema on product pages
- [ ] FAQ schema where applicable

### 4. Content Gap Analysis

**Process:**
1. List top 10 competitor URLs by organic traffic
2. Find keywords competitors rank for that we don't
3. Find questions in "People Also Ask" for our core keywords
4. Check Reddit, Quora, and industry forums for recurring questions
5. Identify pages with high impressions but low CTR in Search Console (optimize title/meta)

**Gap types:**
- **Topic gaps**: entire subject areas competitors cover, we don't
- **Depth gaps**: we cover the topic but shallowly
- **Format gaps**: competitors have video, tools, or calculators; we have text only
- **Freshness gaps**: our content is outdated vs. competitors

## Audit Output Format

```
## SEO Audit — [site] — [date]

### Top Keyword Opportunities
1. [keyword] — [volume] / [KD] — [recommended page]
2. ...

### On-Page Fixes (Quick Wins)
- [page URL]: [specific fix]

### Technical Issues
- Critical: [issue]
- High: [issue]
- Medium: [issue]

### Content Gaps
- [topic]: [why it matters] > [recommended format]

### Recommended Actions (Priority Order)
1. ...
2. ...
3. ...
```

## Tools to Use (if available)
- Google Search Console — impressions, clicks, CTR, position
- Google Analytics — organic traffic, bounce rate, conversions
- PageSpeed Insights — Core Web Vitals
- Screaming Frog (free up to 500 URLs) — crawl and technical audit
- Ahrefs / Semrush / Moz — keyword research, backlinks, competitor analysis