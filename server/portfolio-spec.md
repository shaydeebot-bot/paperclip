# DevPortfolio — Build Spec

## Brand Identity

| Field | Value |
|-------|-------|
| **Name** | DevPortfolio (placeholder — owner customizes) |
| **Tagline** | "Crafting digital experiences that matter." |
| **Domain** | TBD by owner — Vercel preview URL for MVP |
| **Primary Color** | `#6366F1` (Indigo 500) |
| **Secondary Color** | `#8B5CF6` (Violet 500) |
| **Accent** | `#06B6D4` (Cyan 500) |
| **Background (Light)** | `#FFFFFF` (White) |
| **Background (Dark)** | `#0F172A` (Slate 900) |
| **Surface (Light)** | `#F8FAFC` (Slate 50) |
| **Surface (Dark)** | `#1E293B` (Slate 800) |
| **Text Primary (Light)** | `#1E293B` (Slate 800) |
| **Text Primary (Dark)** | `#F1F5F9` (Slate 100) |
| **Text Secondary (Light)** | `#64748B` (Slate 500) |
| **Text Secondary (Dark)** | `#94A3B8` (Slate 400) |
| **Font Heading** | Inter (Google Fonts) — fallback: system-ui, sans-serif |
| **Font Body** | Inter — same family, different weights |
| **Font Mono** | JetBrains Mono (for code snippets in blog) |
| **Border Radius** | 16px (cards), 8px (buttons/inputs), 9999px (pills/tags) |
| **Logo Strategy** | Text wordmark: owner's name in Inter 700, with a small indigo dot accent after the name. No image logo for MVP. |

---

## Tech Stack

| Layer | Choice | Rationale |
|-------|--------|-----------|
| **Framework** | Next.js 14 (App Router) | SSG + SSR flexibility, built-in image optimization, file-based routing |
| **Styling** | Tailwind CSS 3.4 | Utility-first, dark mode via `class` strategy, responsive breakpoints built-in |
| **Email** | Resend SDK (`resend` npm package) | Simple API, good DX, free tier covers portfolio contact volume |
| **Content** | MDX files in `/content/blog/` | No external CMS dependency, git-based, supports JSX components in posts |
| **Blog Engine** | `next-mdx-remote` + `gray-matter` | Frontmatter parsing, server-side MDX compilation |
| **Syntax Highlighting** | `rehype-pretty-code` + `shiki` | Beautiful code blocks in blog posts |
| **Animation** | `framer-motion` | Smooth page transitions, scroll animations, carousel |
| **Icons** | `lucide-react` | Consistent icon set, tree-shakeable |
| **SEO** | Next.js Metadata API + `next-sitemap` | Per-page meta, auto-generated sitemap.xml and robots.txt |
| **Analytics** | Vercel Analytics (optional) | Zero-config with Vercel deploy |
| **Deployment** | Vercel | Native Next.js support, preview deploys, edge functions |
| **Package Manager** | npm | Standard, no additional tooling |
| **Node Version** | 20 LTS | Stable, Vercel default |

---

## Architecture Decisions

### ADR-1: App Router over Pages Router
**Decision**: Use Next.js App Router (`/app` directory).
**Why**: Server Components reduce client bundle, layouts are composable, Metadata API is cleaner than `next/head`. App Router is the stable default since Next.js 13.4+.
**Trade-off**: Some community packages still target Pages Router, but all chosen dependencies support App Router.

### ADR-2: MDX Files over Headless CMS
**Decision**: Blog content lives as `.mdx` files in the repo under `/content/blog/`.
**Why**: Zero external dependency, version-controlled content, supports JSX components inline (code demos, callouts). For a single-author portfolio, a CMS adds complexity without proportional value.
**Trade-off**: Non-technical content editors can't use it — acceptable for a developer portfolio.

### ADR-3: Dark Mode via Tailwind `class` Strategy
**Decision**: Dark mode toggled by adding/removing `dark` class on `<html>`, persisted to `localStorage`, with system preference detection on first visit.
**Why**: `class` strategy gives user control (not just OS preference). `next-themes` handles SSR hydration mismatch for free.
**Trade-off**: Slight flash of wrong theme on hard refresh is solved by `next-themes`' script injection.

### ADR-4: Static Generation with ISR for Blog
**Decision**: All pages are statically generated at build time. Blog posts use `generateStaticParams`. Contact form uses a Server Action (or Route Handler).
**Why**: Maximum performance, CDN-cached, zero server cost. Contact form is the only dynamic piece.
**Trade-off**: Adding a new blog post requires a rebuild (or ISR revalidation). Acceptable — deploy on push.

### ADR-5: Resend via Route Handler (not Server Action)
**Decision**: Contact form POSTs to `/api/contact` Route Handler.
**Why**: Route Handlers are easier to rate-limit, validate, and test independently. Server Actions couple form logic to the component.
**Trade-off**: Slightly more boilerplate than a Server Action, but cleaner separation.

---

## File Structure

```
portfolio/
├── app/
│   ├── layout.tsx              # Root layout: fonts, theme provider, nav, footer
│   ├── page.tsx                # Home: hero + featured projects + testimonials
│   ├── globals.css             # Tailwind directives + custom utilities
│   ├── projects/
│   │   └── page.tsx            # Project gallery with category filtering
│   ├── about/
│   │   └── page.tsx            # About page: bio, skills, experience timeline
│   ├── blog/
│   │   ├── page.tsx            # Blog index: list of posts with tags
│   │   └── [slug]/
│   │       └── page.tsx        # Individual blog post (MDX rendered)
│   ├── contact/
│   │   └── page.tsx            # Contact form page
│   └── api/
│       └── contact/
│           └── route.ts        # POST handler: validate, send via Resend
├── components/
│   ├── layout/
│   │   ├── Navbar.tsx          # Responsive nav with mobile hamburger + dark mode toggle
│   │   └── Footer.tsx          # Footer with social links + copyright
│   ├── home/
│   │   ├── Hero.tsx            # Hero section: name, title, CTA buttons
│   │   ├── FeaturedProjects.tsx # 3 featured project cards (subset of gallery)
│   │   └── Testimonials.tsx    # Testimonial carousel with auto-play
│   ├── projects/
│   │   ├── ProjectCard.tsx     # Individual project card: image, title, tags, links
│   │   └── ProjectFilter.tsx   # Category filter buttons (All, Web, Mobile, etc.)
│   ├── blog/
│   │   ├── BlogCard.tsx        # Blog post preview card: title, date, excerpt, tags
│   │   └── MDXComponents.tsx   # Custom MDX component overrides (callout, code, image)
│   ├── about/
│   │   ├── SkillBar.tsx        # Visual skill level indicator
│   │   └── Timeline.tsx        # Experience/education timeline
│   ├── contact/
│   │   └── ContactForm.tsx     # Client component: form with validation + submission
│   └── ui/
│       ├── ThemeToggle.tsx     # Dark/light mode toggle button
│       ├── Button.tsx          # Reusable button (primary, secondary, ghost variants)
│       ├── Tag.tsx             # Pill-shaped tag for technologies
│       ├── SectionHeading.tsx  # Consistent section title + subtitle
│       └── ScrollReveal.tsx    # Framer Motion scroll-triggered animation wrapper
├── content/
│   ├── blog/
│   │   ├── getting-started-with-nextjs.mdx
│   │   └── building-accessible-forms.mdx
│   └── projects.ts             # Project data array (typed)
├── lib/
│   ├── mdx.ts                  # MDX compilation utilities (serialize, get all posts, get by slug)
│   ├── resend.ts               # Resend client initialization
│   └── types.ts                # Shared TypeScript interfaces
├── public/
│   ├── images/
│   │   ├── projects/           # Project screenshots/thumbnails
│   │   ├── testimonials/       # Client avatar images
│   │   └── og-default.png      # Default OG image (1200x630)
│   ├── favicon.ico
│   └── robots.txt              # Generated by next-sitemap
├── .env.local                  # RESEND_API_KEY, SITE_URL, CONTACT_EMAIL
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
├── package.json
├── next-sitemap.config.js
└── README.md
```

---

## Data Models

### Project

```typescript
interface Project {
  id: string;                    // URL-friendly slug: "ecommerce-dashboard"
  title: string;                 // "E-Commerce Dashboard"
  description: string;           // 1-2 sentence summary
  longDescription?: string;      // Extended description for detail view
  image: string;                 // Path: "/images/projects/ecommerce.png"
  tags: string[];                // ["React", "Node.js", "PostgreSQL"]
  category: ProjectCategory;     // "web" | "mobile" | "design" | "other"
  liveUrl?: string;              // "https://example.com"
  githubUrl?: string;            // "https://github.com/user/repo"
  featured: boolean;             // Show on homepage
  order: number;                 // Display order (lower = first)
}

type ProjectCategory = "web" | "mobile" | "design" | "other";
```

### BlogPost (frontmatter)

```typescript
interface BlogPostFrontmatter {
  title: string;                 // "Getting Started with Next.js"
  date: string;                  // ISO date: "2024-03-15"
  excerpt: string;               // 1-2 sentence preview for cards/SEO
  tags: string[];                // ["Next.js", "React", "Tutorial"]
  coverImage?: string;           // Path to cover image
  published: boolean;            // false = draft, excluded from build
  readingTime?: number;          // Auto-calculated from content length
}

interface BlogPost extends BlogPostFrontmatter {
  slug: string;                  // Derived from filename
  content: string;               // Raw MDX content
}
```

### Testimonial

```typescript
interface Testimonial {
  id: string;
  name: string;                  // "Sarah Johnson"
  role: string;                  // "CEO at TechStartup"
  avatar?: string;               // "/images/testimonials/sarah.jpg"
  quote: string;                 // The testimonial text
  rating?: number;               // 1-5 stars (optional)
}
```

### ContactFormData

```typescript
interface ContactFormData {
  name: string;                  // Required, min 2 chars
  email: string;                 // Required, valid email format
  subject: string;               // Required, min 5 chars
  message: string;               // Required, min 20 chars, max 2000 chars
}
```

---

## API Endpoints

### `POST /api/contact`

Receives contact form submissions and sends email via Resend.

**Request Body:**
```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "subject": "Project Inquiry",
  "message": "Hi, I'd love to discuss a project..."
}
```

**Validation:**
- `name`: string, 2-100 chars, trimmed
- `email`: valid email format (regex + Resend will reject invalid)
- `subject`: string, 5-200 chars, trimmed
- `message`: string, 20-2000 chars, trimmed

**Success Response (200):**
```json
{
  "success": true,
  "message": "Message sent successfully"
}
```

**Error Responses:**
- `400` — Validation failed: `{ "success": false, "errors": { "email": "Invalid email address" } }`
- `429` — Rate limited: `{ "success": false, "message": "Too many requests. Please try again later." }`
- `500` — Resend API error: `{ "success": false, "message": "Failed to send message. Please try again." }`

**Rate Limiting:**
- 3 submissions per IP per 15 minutes (in-memory Map, acceptable for Vercel serverless — resets on cold start, which is fine for a portfolio)

**Email Sent via Resend:**
- **From**: `onboarding@resend.dev` (or custom domain if configured)
- **To**: `CONTACT_EMAIL` env var (portfolio owner's email)
- **Reply-To**: submitter's email
- **Subject**: `[Portfolio Contact] ${subject}`
- **Body**: HTML email with name, email, subject, message, timestamp

---

## Page Specifications

### Home Page (`/`)

**SEO**: Title: "{Name} — Freelance Web Developer", Description: tagline + brief intro.

**Sections (top to bottom):**

1. **Hero**
   - Large heading: owner's name
   - Subtitle: role/tagline (e.g. "Freelance Web Developer & Designer")
   - Brief intro paragraph (2-3 sentences)
   - Two CTA buttons: "View My Work" (→ /projects) and "Get In Touch" (→ /contact)
   - Subtle animated gradient background or geometric pattern
   - Scroll-down indicator arrow

2. **Featured Projects** (3 cards)
   - Section heading: "Featured Work"
   - 3 project cards in a responsive grid (1 col mobile, 3 col desktop)
   - Each card: thumbnail image, title, short description, tech tags, hover lift effect
   - "View All Projects" link at bottom → /projects

3. **Testimonials Carousel**
   - Section heading: "What Clients Say"
   - Auto-rotating carousel (5s interval), pause on hover
   - Each slide: quote text, client name, role, optional avatar
   - Navigation: dots below + prev/next arrows on desktop
   - Framer Motion slide animation
   - 3 placeholder testimonials included in seed data

4. **CTA Banner**
   - "Have a project in mind? Let's talk."
   - Single CTA button → /contact
   - Dark background section (inverted colors)

### Projects Page (`/projects`)

**SEO**: Title: "Projects — {Name}", Description: "A showcase of my web development work..."

**Sections:**

1. **Page Header**
   - Heading: "My Projects"
   - Subtitle: brief description

2. **Category Filter**
   - Horizontal pill buttons: All, Web, Mobile, Design
   - Active state: filled primary color; inactive: outlined
   - Filter is client-side (no page reload), uses URL search params for shareability
   - Animated layout shift when filtering (Framer Motion `AnimatePresence`)

3. **Project Grid**
   - Responsive: 1 col mobile, 2 col tablet, 3 col desktop
   - Each card: image (16:9 ratio), title, description (truncated 2 lines), tags, hover overlay with "View Live" and "GitHub" links
   - Cards animate in on scroll

**Seed Data**: 6 placeholder projects (2 per category) with placeholder images.

### About Page (`/about`)

**SEO**: Title: "About — {Name}", Description: "Learn more about my background..."

**Sections:**

1. **Bio**
   - Profile photo placeholder (circle, 200px)
   - Name, role, location
   - 2-3 paragraph bio text
   - "Download Resume" button (links to a PDF in /public)

2. **Skills**
   - Grid of skill categories: Frontend, Backend, Tools, Design
   - Each category: icon + list of technologies with visual proficiency bars
   - Technologies as colored tags

3. **Experience Timeline**
   - Vertical timeline with alternating left/right entries (single column on mobile)
   - Each entry: date range, company/role, brief description
   - 3-4 placeholder entries

### Blog Index (`/blog`)

**SEO**: Title: "Blog — {Name}", Description: "Articles about web development..."

**Sections:**

1. **Page Header**
   - Heading: "Blog"
   - Subtitle: "Thoughts on web development, design, and technology"

2. **Post List**
   - Sorted by date (newest first)
   - Each card: title, date, reading time, excerpt, tags
   - Responsive: 1 col mobile, 2 col desktop
   - Only published posts shown (frontmatter `published: true`)

**Seed Data**: 2 placeholder MDX blog posts with realistic content.

### Blog Post (`/blog/[slug]`)

**SEO**: Per-post title, description from excerpt, OG image from coverImage or default.

**Layout:**
- Prose-styled content area (max-width 720px, centered)
- Post header: title, date, reading time, tags
- MDX content with custom components: syntax-highlighted code blocks, callout boxes, images with captions
- "Back to Blog" link at top
- Previous/Next post navigation at bottom

**Structured Data**: JSON-LD `BlogPosting` schema for each post.

### Contact Page (`/contact`)

**SEO**: Title: "Contact — {Name}", Description: "Get in touch for project inquiries..."

**Sections:**

1. **Contact Form** (client component)
   - Fields: Name, Email, Subject, Message (textarea)
   - Client-side validation with inline error messages
   - Submit button with loading spinner state
   - Success: green toast/banner "Message sent! I'll get back to you soon."
   - Error: red toast/banner with message
   - Honeypot field (hidden) for basic spam prevention

2. **Alternative Contact**
   - "Or reach me directly at:"
   - Email address (mailto link)
   - Social links: GitHub, LinkedIn, Twitter/X (icons)

---

## Responsive Breakpoints

| Breakpoint | Tailwind | Usage |
|------------|----------|-------|
| Mobile | Default (< 640px) | Single column, hamburger nav, stacked layout |
| Tablet | `sm:` (640px) | 2-column grids, expanded nav |
| Desktop | `lg:` (1024px) | 3-column grids, full nav bar, side-by-side layouts |
| Wide | `xl:` (1280px) | Max content width (1200px), centered |

---

## Dark Mode Implementation

1. Install `next-themes` package
2. Wrap app in `<ThemeProvider attribute="class" defaultTheme="system" enableSystem>`
3. `ThemeToggle` component: sun/moon icon button, cycles light → dark → system
4. Persist choice in `localStorage` (handled by next-themes)
5. Tailwind config: `darkMode: "class"`
6. All color choices use Tailwind's `dark:` variant (e.g. `bg-white dark:bg-slate-900`)

---

## SEO Strategy

1. **Metadata API**: Each page exports a `metadata` object or `generateMetadata` function
2. **Sitemap**: `next-sitemap` auto-generates `sitemap.xml` and `robots.txt` on build
3. **OG Images**: Default OG image at `/public/images/og-default.png`; blog posts can override
4. **Structured Data**: JSON-LD for `Person` (home), `BlogPosting` (blog posts), `WebSite` (global)
5. **Semantic HTML**: Proper heading hierarchy, `<article>`, `<nav>`, `<main>`, `<section>` tags
6. **Performance**: Next.js Image component for all images (WebP, lazy loading, responsive sizes)
7. **Canonical URLs**: Set via Metadata API to prevent duplicate content

---

## Environment Variables

```bash
# .env.local (not committed)
RESEND_API_KEY=re_xxxxxxxxxxxx    # Resend API key for contact form
CONTACT_EMAIL=your@email.com      # Email address to receive contact form submissions
SITE_URL=https://yoursite.com     # Used for sitemap, OG URLs, canonical links
```

---

## Deployment

**Target**: Vercel (free tier is sufficient for a portfolio)

**Steps:**
1. Push to GitHub repository
2. Connect repo to Vercel
3. Set environment variables in Vercel dashboard
4. Vercel auto-detects Next.js, builds, and deploys
5. Preview deploys on every PR, production on `main` push

**Build Command**: `next build` (default)
**Output**: Static HTML + serverless functions (for `/api/contact`)

---

## Admin / Content Management

- **Projects**: Edit `content/projects.ts` array, commit, push → auto-deploys
- **Blog Posts**: Add `.mdx` file to `content/blog/`, commit, push → auto-deploys
- **Testimonials**: Edit testimonials array in `content/testimonials.ts`, commit, push
- **Personal Info**: Update constants in a `lib/config.ts` file (name, role, bio, social links)
- **No admin dashboard needed** — developer portfolio, git is the CMS

---

## Pricing

N/A — This is a personal portfolio site, not a SaaS product. No pricing tiers.

**Cost to operate:**
- Vercel: $0 (Hobby plan — sufficient for portfolio traffic)
- Resend: $0 (free tier — 3,000 emails/month, far exceeds contact form volume)
- Domain: ~$10-15/year (purchased separately by owner)
- **Total**: ~$1/month amortized

---

## Build Phases

### Phase 1: Project Scaffold & Layout (foundation)
- `npx create-next-app@latest portfolio --typescript --tailwind --app --src-dir=false`
- Configure `tailwind.config.ts` with custom colors, dark mode
- Install dependencies: `next-themes`, `framer-motion`, `lucide-react`
- Build root layout: fonts, ThemeProvider, global styles
- Build Navbar (responsive, mobile menu, dark mode toggle)
- Build Footer (social links, copyright)
- Create `lib/config.ts` with placeholder personal info
- Create UI components: Button, Tag, SectionHeading, ScrollReveal

### Phase 2: Home Page (hero + featured + testimonials)
- Build Hero component with animated gradient background
- Build FeaturedProjects component (static data from `content/projects.ts`)
- Build Testimonials carousel with framer-motion
- Build CTA banner section
- Assemble home page
- Create seed data: 6 projects, 3 testimonials

### Phase 3: Projects & About Pages
- Build ProjectCard and ProjectFilter components
- Build Projects page with client-side category filtering
- Build About page: bio section, skills grid, experience timeline
- Add scroll animations via ScrollReveal wrapper

### Phase 4: Blog Engine
- Install `next-mdx-remote`, `gray-matter`, `rehype-pretty-code`, `shiki`
- Build MDX utilities in `lib/mdx.ts` (getAllPosts, getPostBySlug)
- Build blog index page with BlogCard components
- Build blog post page with MDX rendering and custom components
- Write 2 seed blog posts in MDX
- Add prev/next post navigation
- Add JSON-LD structured data for blog posts

### Phase 5: Contact Form & Email
- Install `resend` package
- Build `/api/contact` Route Handler with validation + rate limiting
- Build ContactForm client component with form validation
- Build contact page with form + alternative contact info
- Add honeypot spam prevention
- Test end-to-end with Resend

### Phase 6: SEO & Polish
- Configure `next-sitemap` for sitemap.xml + robots.txt generation
- Add Metadata API exports to all pages
- Add JSON-LD structured data (Person, WebSite)
- Create OG default image placeholder
- Accessibility pass: focus states, aria labels, skip-to-content link, color contrast
- Performance pass: ensure all images use `next/image`, check Lighthouse score
- Cross-browser check: Chrome, Firefox, Safari, mobile

### Phase 7: Deploy
- Create GitHub repo (or use existing)
- Connect to Vercel
- Set environment variables (RESEND_API_KEY, CONTACT_EMAIL, SITE_URL)
- Deploy to preview, smoke test all pages + contact form
- Deploy to production
- Verify sitemap.xml accessible, robots.txt correct

---

## Self-Check Score

| # | Question | Score | Notes |
|---|----------|-------|-------|
| 1 | Could an engineer build this without asking questions? | 9/10 | All pages, components, and data models fully specified |
| 2 | Are all pages, endpoints, and data models specified? | 9/10 | 5 pages, 1 API endpoint, 4 data models, all detailed |
| 3 | Is pricing concrete? | 10/10 | N/A for portfolio — operating costs documented |
| 4 | Is the tech stack explicitly chosen? | 10/10 | Every layer specified with rationale |
| 5 | Are edge cases and error states addressed? | 8/10 | Contact form errors, rate limiting, spam prevention, dark mode flash, draft posts |

**Overall: 9.2/10** — Spec is implementation-ready.
