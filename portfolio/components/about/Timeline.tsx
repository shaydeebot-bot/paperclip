'use client'

import ScrollReveal from '@/components/ui/ScrollReveal'

interface TimelineEntry {
  date: string
  title: string
  company: string
  description: string
}

const entries: TimelineEntry[] = [
  {
    date: '2022 — Present',
    title: 'Senior Freelance Developer',
    company: 'Self-Employed',
    description:
      'Building full-stack web applications for startups and agencies. Specializing in Next.js, React, and Node.js. Delivered 30+ projects with a 100% client satisfaction rate.',
  },
  {
    date: '2019 — 2022',
    title: 'Full Stack Developer',
    company: 'Digital Agency Co.',
    description:
      'Led development of client-facing web applications. Mentored junior developers and established coding standards. Reduced average project delivery time by 25%.',
  },
  {
    date: '2017 — 2019',
    title: 'Frontend Developer',
    company: 'TechCorp Inc.',
    description:
      'Built responsive, accessible UIs for enterprise SaaS products. Migrated legacy jQuery codebase to React, improving performance by 60%.',
  },
  {
    date: '2013 — 2017',
    title: 'B.S. Computer Science',
    company: 'State University',
    description:
      'Graduated with honors. Focused on HCI and web technologies. Built award-winning capstone project — a real-time collaboration tool.',
  },
]

export default function Timeline() {
  return (
    <div className="relative">
      {/* Vertical line */}
      <div className="absolute left-0 lg:left-1/2 top-0 bottom-0 w-px bg-slate-200 dark:bg-slate-700 -translate-x-1/2 hidden sm:block" />

      <div className="space-y-12">
        {entries.map((entry, i) => (
          <ScrollReveal
            key={entry.date}
            delay={i * 0.1}
            direction={i % 2 === 0 ? 'left' : 'right'}
          >
            <div
              className={`relative sm:pl-8 lg:pl-0 lg:grid lg:grid-cols-2 lg:gap-12 ${
                i % 2 === 0 ? '' : 'lg:direction-rtl'
              }`}
            >
              {/* Dot */}
              <div className="absolute left-0 lg:left-1/2 top-1 w-3 h-3 rounded-full bg-primary border-4 border-white dark:border-[#0F172A] -translate-x-1/2 hidden sm:block" />

              {/* Content */}
              <div
                className={`${
                  i % 2 === 0
                    ? 'lg:text-right lg:pr-12'
                    : 'lg:col-start-2 lg:pl-12'
                }`}
                style={{ direction: 'ltr' }}
              >
                <span className="inline-block text-xs font-mono font-medium text-primary bg-primary/10 px-3 py-1 rounded-pill mb-3">
                  {entry.date}
                </span>
                <h3 className="font-display font-bold text-lg text-slate-900 dark:text-white">
                  {entry.title}
                </h3>
                <p className="text-sm font-body text-primary mb-2">
                  {entry.company}
                </p>
                <p className="text-sm font-body text-slate-600 dark:text-slate-400 leading-relaxed">
                  {entry.description}
                </p>
              </div>
            </div>
          </ScrollReveal>
        ))}
      </div>
    </div>
  )
}
