---
name: frontend-design
description: >
  Create distinctive, production-grade frontend interfaces with high design quality.
  Provides a process (context, direction, build, integrate, verify), universal rules for
  typography/color/motion/accessibility, and direction-specific patterns for multiple
  aesthetic styles. Avoids generic AI aesthetics.
---

# Frontend Design

## Process

1. **Context** — What is this? Who uses it? What's the one thing someone will remember?
2. **Direction** — Pick an aesthetic direction. This determines which pattern set to load:
   `dark-editorial` / `dark-minimal` / `organic` / `playful` / `luxury` / `brutalist` / `retro-futuristic` / `soft-pastel` / `maximalist` / `art-deco` / `industrial`
3. **Build** — Apply universal rules + direction-specific patterns
4. **Integrate** — Match existing design system if building into a product
5. **Verify** — Responsive check (375px / 768px / 1024px+). Note aesthetic direction in a code comment.

---

## Universal Rules (Apply to ALL Directions)

These always apply regardless of aesthetic direction.

### Typography
- **Always pair fonts**: One serif/display face + one geometric sans. Example: `Instrument Serif` + `Space Grotesk`, or `Playfair Display` + `DM Sans`.
- **Three-tier text hierarchy**: Primary, secondary, muted — defined as CSS variables. The gap between tiers should be obvious, not subtle.
- **Letter-spacing is a tool**: Display headings get negative tracking (`-0.02em` to `-0.03em`). Nav/labels get wide tracking (`0.1em`+, uppercase). Body stays default.
- **Font size ratio**: Hero h1 >= 4.5rem, section h2 ~3rem, card h3 ~1.05rem. The jump between hero and section heading should be dramatic.

### Color
- **Never default to purple/indigo on dark.** #1 "AI-generated" tell.
- **Never use Tailwind blue (#3b82f6).** #2 "AI-generated" tell.
- **Accent glow**: Define an accent-glow color at ~12-15% opacity for box-shadows, radial gradients, and hover states.
- **Define 3+ surface levels** (bg -> surface -> surface-2) with clear lightness steps between them.

### Page Completeness (Landing Page)
A landing page must include ALL of these sections:

1. **Nav** — Logo + links + primary CTA button
2. **Hero** — Tag line + headline + subheadline + CTA pair (primary + ghost) + product/domain visual
3. **Social proof bar** — 3-4 metrics with accent-colored values
4. **Features** — With hover effects. Format depends on direction (see direction-specific patterns).
5. **Product preview** — Stylized mockup showing the actual product
6. **Testimonial** — Quote with attribution, serif font for the quote text
7. **Pricing** — 3-tier grid. Featured tier must have 3+ visual differentiators
8. **Final CTA** — Banner with heading + button + subtle gradient overlay
9. **Footer** — Copyright + legal links + social links

### Motion & Interaction
- **Max 2 CSS animations**: One ambient + one triggered. CSS-first, minimal JS.
- **One animated signature moment is required.** The element that makes someone screenshot the page. Examples: staggered data reveal, animated chart drawing, plant leaves swaying, counter incrementing.
- **Hover states are required** on all interactive elements.
- **Never hide content behind animations.** Default `opacity: 1` — animation is enhancement only.
- **Respect `prefers-reduced-motion`.** Wrap animations in `@media (prefers-reduced-motion: no-preference)`.

### Accessibility (Mandatory)
- **Never use color alone to indicate status.** Always pair with icons or text: checkmark healthy, warning degraded, X critical. User may be colorblind.
- **Data visualizations** must not rely solely on color gradients. Add labels, patterns, or brightness variation.
- **Interactive elements** need visible focus states for keyboard navigation.

### Design System Cohesion
- **Shared CSS variables** for all panel/mockup styling: `--panel-bg`, `--panel-border`, `--panel-header-bg`, `--radius-sm`, `--radius-md`
- **Every mockup panel** must use the same background color, border style, header treatment, and label typography.
- **If it looks like 3 different designers made the mockups, the design system failed.**

### Polish Techniques
- **SVG depth**: Use `linearGradient` fills, secondary detail lines at 0.04-0.08 opacity. Overlapping elements at different opacities create depth.
- **Unique visuals per card**: Never reuse the same placeholder icon for every entry in a mockup.
- **Decorative elements**: Large decorative quote marks on testimonials. Subtle shape watermarks on featured cards/CTA banners.
- **Section transitions**: Gradient fade dividers between major sections, not just hard borders.
- **Product preview grounding**: Subtitle with realistic data (e.g., "3 plants - 2 need attention").

### Anti-Patterns (Automatic Deductions — All Directions)
- Emoji as feature icons
- Inter, Roboto, or Arial as the primary font
- Purple/indigo accent on dark background
- Tailwind blue-500 (#3b82f6) as primary accent
- Centered single-column layout for the entire page
- Perfectly symmetric card grid with equal spacing
- Missing social proof (no metrics bar, no testimonial)
- Scroll-triggered animations that hide content when JS fails
- Color-only status indicators without icon/text labels

---

## Direction-Specific Patterns

After picking a direction in Step 2, load ONLY the patterns for that direction below. Do not mix patterns from other directions unless explicitly adapting them.

### Dark Editorial / Dark Minimal
*Benchmark: Linear, Vercel, Stripe.*

**Color**: Warm dark undertones — `#0a0a08` not `#0a0a0e`. Cool-gray dark themes read as "dark mode template." Primary text: warm off-white `#f2ede5`, not pure `#fff`. Accent: warm tones (amber, burnt orange, coral) or unexpected cools (teal, olive).

**Layout**:
- Left-align hero text when using product-as-hero. Visual continuity > centered symmetry.
- Full-bleed product mockup: `width: 100vw; margin-left: calc(-50vw + 50%)`. Implies "there's more."
- Split section headers: heading left, supporting text right (2-column grid, bottom-aligned).
- Section proportions vary **dramatically**: 2rem / 3.5rem / 5.5rem — NOT 3rem / 4rem / 5rem.
- 1px-gap feature grids. Background-color on grid container = border color.
- Borders as design language: `1px solid` on sections, nav, metrics, pricing.
- `border-radius: 2-4px` on buttons. Never 8px+.

**Hero Visual**:
- The hero IS the product — multi-pane app mockup (sidebar + main + secondary panel), NOT a decorative graphic.
- Edge-breaking: product mockup extends beyond content column (`margin: 0 -6rem`).
- Include realistic nav items, environment selectors, team sections in sidebar.
- Data must be varied: different sparkline shapes per row, percentage arrows (up 12%, down 3%), timestamps.

**Features**: Inline product demos > numbered text cards. Show 2-3 features as alternating text + product visualization (heatmap, terminal, trace waterfall). Limit card grids to 3 max.

**Signature Moment Example**: Staggered data reveal — trace replay where rows appear at 200ms intervals, bottleneck row gets a red flash animation.

### Organic / Natural
*Benchmark: Notion (warm personality).*

**Color**: Dark olive/forest backgrounds with green accent. Or warm cream/sand backgrounds with earthy accents. Add subtle brown/green undertones to surface levels. Primary text: warm cream `#f0ede4`.

**Layout**:
- Asymmetric 2-column hero (text left, domain visual right).
- Dot-grid or organic noise texture overlay (not geometric grid).
- Rounded borders OK — `border-radius: 6-8px` for cards fits the organic feel.
- Split section headers still work here.
- Feature cards with gentle hover transitions (background shift, not hard accent bars).

**Hero Visual**:
- Domain-relevant SVG illustration (plant, wave, landscape) — NOT a product mockup unless the product IS nature-related.
- Use `linearGradient` fills for SVG depth. Multiple leaf/element layers at different opacities.
- Animated elements: gentle sway (`2deg` rotation, 5-7s duration), pulsing water/light effects.

**Features**: Numbered cards work here (01, 02, 03). Hover effect: number changes to accent color + top accent bar slides in.

**Signature Moment Example**: SVG illustration with animated elements — leaves swaying at different speeds, water droplets falling with staggered delays.

### Playful / Soft-Pastel

**Color**: Light backgrounds (off-white, warm cream, soft pastels). Avoid pure white `#fff` — use `#faf9f6` or similar. Bold, saturated accent colors. Multiple accent colors OK (primary + secondary).

**Layout**:
- More whitespace than editorial. Generous padding (5-6rem between sections).
- Centered layouts acceptable if broken by asymmetric elements (offset images, tilted cards).
- Larger `border-radius` (12-16px) on cards and containers.
- No 1px-gap grids — use spaced cards with shadows instead.
- No hard border lines — use shadows and elevation for separation.

**Hero Visual**:
- Custom illustrations or bold product screenshot with rounded frame.
- Playful elements: confetti, floating shapes, bouncing icons.
- OK to use centered hero layout with illustration below or beside text.

**Features**: Icon-based cards with illustrations or custom SVG icons. NOT numbered. Generous card padding, shadow elevation on hover.

**Signature Moment Example**: Interactive element — hover to reveal, animated counter, playful loading state.

### Luxury / Art Deco

**Color**: Black + gold/champagne, or deep navy + silver. Very restrained palette — max 3 colors total. High contrast between text and background.

**Layout**:
- Generous whitespace. Sections breathe.
- Centered layouts work when paired with oversized typography and controlled density.
- Thin borders (0.5px) and fine lines. Geometric patterns as texture.
- Small caps and wide letter-spacing on labels.

**Hero Visual**:
- Minimal — typography IS the visual. Oversized serif headline.
- Product screenshot (if any) in a thin elegant frame.

**Features**: Minimal card count (3 max). Lots of whitespace. Icon-free — rely on typography hierarchy.

**Signature Moment Example**: Reveal animation on scroll — text or product fades in with smooth easing and long duration (800ms+).

### Brutalist / Industrial

**Color**: Harsh contrasts. Black/white with one neon accent (lime, hot pink, electric blue). Raw, unpolished feel.

**Layout**:
- Intentionally "broken" grids. Overlapping elements. Visible structure (outlines, monospace labels).
- Hard borders, no border-radius anywhere. Square everything.
- Dense text. Less whitespace than other directions.

**Hero Visual**:
- Raw product screenshot with no chrome frame. Or pure text hero with monospace headline.
- Visible grid lines, exposed wireframe elements.

**Features**: Dense list or table format. Not cards — raw data presentation.

**Signature Moment Example**: Glitch animation, terminal-style text typing effect, or harsh color flash on interaction.

---

## Existing Product Integration

When building into an existing codebase:
- **Extract first**: Read existing design tokens (colors, fonts, spacing, border-radius, shadows). Match them exactly.
- **Use CSS variables**: If `--color-primary` exists, use it. Never hardcode colors that have variables.
- **Reuse patterns**: Cards, buttons, nav, footer — new pages should feel like the same product.
- **Page shell**: Consistent header/nav and footer. Copy the existing shell structure.
