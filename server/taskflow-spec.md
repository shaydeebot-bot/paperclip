# TaskFlow Landing Page — Build Spec

## Brand Identity

| Field | Value |
|-------|-------|
| **Name** | TaskFlow |
| **Tagline** | "Work flows better together." |
| **Domain** | taskflow.app (target) |
| **Primary Color** | `#4F46E5` (Indigo 600) |
| **Secondary Color** | `#3B82F6` (Blue 500) |
| **Accent** | `#06B6D4` (Cyan 500) |
| **Background** | `#F8FAFC` (Slate 50) |
| **Dark Background** | `#0F172A` (Slate 900) — for footer/CTA banner |
| **Text Primary** | `#1E293B` (Slate 800) |
| **Text Secondary** | `#64748B` (Slate 500) |
| **Font** | Inter (Google Fonts) — fallback: system-ui, sans-serif |
| **Border Radius** | 12px (cards), 8px (buttons), 24px (badges) |
| **Logo Strategy** | Text-only wordmark: "TaskFlow" with "Task" in primary color, "Flow" in secondary. No image logo needed for MVP. |

---

## Tech Stack

| Layer | Choice |
|-------|--------|
| **Delivery** | Single static HTML file — no build step |
| **Styling** | Inline `<style>` block — no external CSS framework |
| **Interactivity** | Vanilla JS — pricing toggle (monthly/annual), smooth scroll, mobile nav |
| **Icons** | Lucide Icons via CDN (`https://unpkg.com/lucide@latest`) |
| **Fonts** | Google Fonts CDN (Inter 400, 500, 600, 700) |
| **Deployment** | Vercel (static) or any static host |

**Output**: A single `index.html` file in a new `taskflow/` directory.

---

## File Structure

```
taskflow/
├── index.html          # Complete landing page (HTML + CSS + JS inline)
├── favicon.svg         # Simple SVG favicon (checkmark in indigo circle)
└── og-image.html       # (optional) OG image reference — 1200x630
```

---

## Page Sections (top to bottom)

### 1. Navigation Bar
- **Position**: Sticky top, white background with subtle bottom border, blurs on scroll
- **Left**: TaskFlow wordmark (text logo)
- **Right**: Links — Features, Pricing, Integrations, "Get Started Free" button (primary, filled)
- **Mobile**: Hamburger menu → slide-down overlay with same links
- **Height**: 64px

### 2. Hero Section
- **Layout**: Two columns on desktop (text left, visual right). Single column stacked on mobile.
- **Left column**:
  - Badge: "✨ Now with AI-powered task suggestions" — small pill, indigo background at 10% opacity, indigo text
  - Headline: **"Manage tasks the way your team actually works"** — 56px, font-weight 700, Slate 800
  - Subheadline: "Kanban boards, built-in time tracking, and team chat — all in one place. No more switching between five different apps." — 20px, Slate 500, max-width 540px
  - CTA group:
    - Primary button: "Start Free — No Credit Card" → `#signup` — indigo background, white text, 48px height, subtle shadow
    - Secondary button: "Watch Demo →" → `#demo` — ghost/outline style
  - Social proof line: "Trusted by 2,400+ teams worldwide" with 5 small circular avatar placeholders (gray circles with initials) and a 5-star rating
- **Right column**:
  - A styled mock screenshot of a Kanban board — built with pure HTML/CSS (not an image). Shows 3 columns: "To Do" (3 cards), "In Progress" (2 cards), "Done" (2 cards). Cards have colored left borders, titles, assignee avatars, and due date chips.
- **Background**: Subtle gradient from white to slate-50, with a faint grid pattern (CSS only)

### 3. Logos Bar
- **Label**: "Trusted by teams at" — small, uppercase, letter-spaced, Slate 400
- **Logos**: 6 placeholder company logos as styled text in gray (e.g., "Acme Co", "Globex", "Initech", "Hooli", "Pied Piper", "Stark Ind") — use a grayscale, lightweight treatment
- **Layout**: Horizontal scroll on mobile, centered row on desktop
- **Separator**: Thin top/bottom borders

### 4. Features Grid
- **Headline**: "Everything your team needs" — centered, 40px
- **Subheadline**: "Powerful alone. Better together." — centered, Slate 500
- **Grid**: 2×3 on desktop, 1-column on mobile
- **Each card**:
  - Lucide icon in a 48px indigo-tinted circle
  - Feature name (18px, bold)
  - 2-line description (Slate 500)
  - Subtle hover: lift + shadow transition

| # | Icon | Feature | Description |
|---|------|---------|-------------|
| 1 | `kanban` (layout-grid) | Kanban Boards | Drag-and-drop boards that adapt to your workflow. Create custom columns, labels, and swimlanes. |
| 2 | `clock` | Time Tracking | Built-in timers on every task. See where your team's hours go with automatic reports. |
| 3 | `message-circle` | Team Chat | Real-time messaging right next to your tasks. No more context-switching to Slack. |
| 4 | `git-branch` | GitHub Sync | Link commits and PRs to tasks automatically. Your code and project management in one view. |
| 5 | `zap` | Automations | Set rules to auto-assign, move, or notify. "When status changes to Done → notify #general." |
| 6 | `bar-chart-3` | Analytics | Dashboard with burndown charts, velocity tracking, and team workload visualization. |

### 5. How It Works
- **Headline**: "Up and running in 3 minutes"
- **Layout**: 3 numbered steps, horizontal on desktop, vertical on mobile
- **Each step**: Large number (72px, indigo at 10% opacity behind), title, 1-line description
  1. **Create your workspace** — "Sign up free and invite your team with a single link."
  2. **Set up your boards** — "Start from a template or build your own from scratch."
  3. **Start flowing** — "Assign tasks, track time, and chat — all without leaving TaskFlow."

### 6. Integrations Section
- **Headline**: "Plays nice with your stack"
- **Subheadline**: "Connect the tools you already use."
- **Layout**: Centered grid of integration "chips" — rounded rectangles with icon + name
- **Integrations**: Slack, GitHub, GitLab, Figma, Google Drive, Notion, Zapier, Jira (8 total)
- **Each chip**: 40px icon placeholder (first letter in colored circle) + name, light border, hover highlight
- **Below grid**: "And 30+ more integrations →" link

### 7. Pricing Table
- **Headline**: "Simple, transparent pricing"
- **Subheadline**: "Start free. Upgrade when you're ready."
- **Toggle**: Monthly / Annual (annual shows "Save 20%" badge) — pill-style toggle
- **Layout**: 3 cards side by side on desktop, stacked on mobile. Pro card is visually elevated ("Most Popular" badge).

| | Free | Pro | Team |
|---|------|-----|------|
| **Monthly Price** | $0 | $12/user/mo | $29/user/mo |
| **Annual Price** | $0 | $10/user/mo | $24/user/mo |
| **CTA** | "Get Started" (outline) | "Start Free Trial" (filled, primary) | "Start Free Trial" (filled, dark) |
| **Feature 1** | Up to 3 boards | Unlimited boards | Everything in Pro |
| **Feature 2** | 5 team members | Unlimited members | Advanced permissions |
| **Feature 3** | Basic time tracking | Full time tracking + reports | SAML SSO |
| **Feature 4** | 500MB storage | 10GB storage | 100GB storage |
| **Feature 5** | Community support | Priority email support | Dedicated account manager |
| **Feature 6** | — | GitHub + Slack integrations | All integrations + API access |
| **Feature 7** | — | Automations (50/mo) | Unlimited automations |
| **Feature 8** | — | — | Custom onboarding |

- **Styling**:
  - Free: White card, standard border
  - Pro: White card, indigo border-top (3px), slight scale(1.05), "Most Popular" badge (indigo pill top-right)
  - Team: Slate-900 background, white text, "For growing teams" subtitle
- **Below table**: "All plans include: SSL, 99.9% uptime SLA, GDPR compliance, data export" — small text, centered

### 8. Testimonials
- **Headline**: "Teams love TaskFlow"
- **Layout**: 3 cards in a row (desktop), horizontal scroll (mobile)
- **Each card**:
  - 5 stars (filled, amber)
  - Quote text in italics (2-3 sentences)
  - Name, role, company — with avatar circle (initials)

| # | Quote | Name | Role |
|---|-------|------|------|
| 1 | "We replaced Trello, Toggl, and half our Slack channels with TaskFlow. Our team saved 6 hours a week." | Sarah Chen | Engineering Lead, Acme |
| 2 | "The built-in chat is a game-changer. No more losing context switching between apps." | Marcus Johnson | Product Manager, Globex |
| 3 | "Setup took literally 3 minutes. We had our entire sprint board migrated by lunch." | Priya Patel | CTO, Initech |

### 9. CTA Banner
- **Background**: Indigo-to-blue gradient (left to right), full-width
- **Content** (centered):
  - Headline: "Ready to make work flow?" — white, 36px
  - Subheadline: "Join 2,400+ teams. Free forever for up to 5 members." — white at 80% opacity
  - Button: "Get Started Free →" — white background, indigo text, large (52px height)
- **Visual flair**: Subtle floating geometric shapes (CSS only — rotated squares at low opacity)

### 10. Footer
- **Background**: Slate 900 (dark)
- **Layout**: 4-column grid on desktop, stacked on mobile
- **Column 1**: TaskFlow logo + "Work flows better together." + social icons (Twitter, LinkedIn, GitHub — as text links for MVP)
- **Column 2 — Product**: Features, Pricing, Integrations, Changelog, Roadmap
- **Column 3 — Company**: About, Blog, Careers, Contact, Press Kit
- **Column 4 — Legal**: Privacy Policy, Terms of Service, Security, GDPR, Status
- **Bottom bar**: "© 2026 TaskFlow. All rights reserved." + "Made with ❤️ for productive teams"

---

## Responsive Breakpoints

| Breakpoint | Width | Notes |
|------------|-------|-------|
| Mobile | < 640px | Single column, stacked layout, hamburger nav |
| Tablet | 640–1024px | 2-column grids, slightly reduced spacing |
| Desktop | > 1024px | Full layout as described above |

---

## Interactions & Animations

- **Scroll reveal**: Sections fade-in + slide-up on scroll (IntersectionObserver, vanilla JS)
- **Pricing toggle**: Smooth number transition when switching monthly ↔ annual
- **Nav**: Background opacity transitions from transparent to white on scroll
- **Kanban mock**: Subtle floating animation on hero illustration (CSS `@keyframes`)
- **Hover states**: All buttons scale 1.02 + shadow transition. Cards lift 4px.
- **Smooth scroll**: All anchor links scroll smoothly (`scroll-behavior: smooth`)

---

## SEO & Meta

```html
<title>TaskFlow — Task Management for Teams That Ship</title>
<meta name="description" content="Kanban boards, time tracking, and team chat in one app. Free for up to 5 members. Start in 3 minutes.">
<meta property="og:title" content="TaskFlow — Work flows better together">
<meta property="og:description" content="Manage tasks the way your team actually works. Kanban boards, time tracking, team chat, and integrations.">
<meta property="og:type" content="website">
<meta property="og:image" content="/og-image.png">
<meta name="twitter:card" content="summary_large_image">
```

---

## Performance Requirements

- **Lighthouse score**: 95+ on Performance, 100 on Accessibility
- **Total page weight**: < 150KB (excluding fonts)
- **No external JS frameworks** — vanilla only
- **Font loading**: `font-display: swap` on all Google Font imports
- **Images**: Zero raster images — all visuals built with CSS/SVG

---

## Admin Access Strategy

Not applicable for a static landing page. No backend, no auth, no admin panel.

---

## Build Phases

| Phase | Description | Deliverable |
|-------|-------------|-------------|
| **1** | Scaffold HTML structure with all 10 sections, meta tags, font imports | Skeleton `index.html` |
| **2** | Style navigation, hero section (including CSS Kanban mock), and logos bar | Visual hero complete |
| **3** | Style features grid, how-it-works, and integrations section | Mid-page complete |
| **4** | Build pricing table with monthly/annual toggle JS | Interactive pricing |
| **5** | Style testimonials, CTA banner, and footer | Full page styled |
| **6** | Add scroll animations, hover effects, responsive breakpoints, mobile nav | Polished & responsive |
| **7** | Create favicon.svg, verify meta tags, Lighthouse audit, final QA | Ship-ready |

---

## Self-Check Score: 8/10

1. ✅ Could an engineer build this without asking questions? — Yes, every section is fully specified.
2. ✅ Are all pages, endpoints, and data models specified? — Single page, no endpoints.
3. ✅ Is pricing concrete? — $0 / $12 / $29 with annual discounts.
4. ✅ Is the tech stack explicitly chosen? — Static HTML, inline CSS/JS, no framework.
5. ✅ Are edge cases and error states addressed? — Responsive breakpoints, mobile nav, font fallbacks, no-JS graceful degradation (scroll animations are enhancement only).
