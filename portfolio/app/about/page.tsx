import { Metadata } from 'next'
import {
  Code2,
  Server,
  Wrench,
  Palette,
  Download,
  MapPin,
} from 'lucide-react'
import SectionHeading from '@/components/ui/SectionHeading'
import ScrollReveal from '@/components/ui/ScrollReveal'
import SkillBar from '@/components/about/SkillBar'
import Timeline from '@/components/about/Timeline'
import Button from '@/components/ui/Button'
import { siteConfig } from '@/lib/config'

export const metadata: Metadata = {
  title: 'About',
  description: `Learn more about ${siteConfig.name}'s background, skills, and experience in web development.`,
}

const skillCategories = [
  {
    category: 'Frontend',
    icon: <Code2 size={20} />,
    skills: [
      { name: 'React / Next.js', level: 95 },
      { name: 'TypeScript', level: 90 },
      { name: 'Tailwind CSS', level: 92 },
      { name: 'Framer Motion', level: 85 },
    ],
  },
  {
    category: 'Backend',
    icon: <Server size={20} />,
    skills: [
      { name: 'Node.js', level: 90 },
      { name: 'PostgreSQL', level: 85 },
      { name: 'REST / GraphQL', level: 88 },
      { name: 'Prisma', level: 82 },
    ],
  },
  {
    category: 'Tools',
    icon: <Wrench size={20} />,
    skills: [
      { name: 'Git / GitHub', level: 95 },
      { name: 'Docker', level: 78 },
      { name: 'Vercel / AWS', level: 85 },
      { name: 'CI/CD', level: 80 },
    ],
  },
  {
    category: 'Design',
    icon: <Palette size={20} />,
    skills: [
      { name: 'Figma', level: 88 },
      { name: 'UI/UX Design', level: 82 },
      { name: 'Responsive Design', level: 95 },
      { name: 'Accessibility', level: 85 },
    ],
  },
]

export default function AboutPage() {
  return (
    <div className="py-24 lg:py-32">
      <div className="max-w-6xl mx-auto px-6">
        {/* Bio Section */}
        <section className="mb-24 lg:mb-32">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 lg:gap-16 items-start">
            <ScrollReveal className="lg:col-span-2">
              <div className="sticky top-24">
                {/* Avatar placeholder */}
                <div className="w-48 h-48 mx-auto lg:mx-0 rounded-full bg-gradient-to-br from-primary via-violet-500 to-accent p-1">
                  <div className="w-full h-full rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                    <span className="font-display font-bold text-5xl text-primary/40">
                      {siteConfig.name
                        .split(' ')
                        .map((n) => n[0])
                        .join('')}
                    </span>
                  </div>
                </div>
                <div className="mt-6 text-center lg:text-left">
                  <h1 className="font-display font-bold text-2xl text-slate-900 dark:text-white">
                    {siteConfig.name}
                  </h1>
                  <p className="text-primary font-body font-medium mt-1">
                    {siteConfig.role}
                  </p>
                  <p className="flex items-center justify-center lg:justify-start gap-1.5 text-sm text-slate-500 dark:text-slate-400 font-body mt-2">
                    <MapPin size={14} />
                    {siteConfig.location}
                  </p>
                  <div className="mt-6">
                    <Button variant="secondary" href="/resume.pdf">
                      <Download size={16} />
                      Download Resume
                    </Button>
                  </div>
                </div>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={0.2} className="lg:col-span-3">
              <div className="space-y-6">
                {siteConfig.bio.map((paragraph, i) => (
                  <p
                    key={i}
                    className="text-lg font-body text-slate-600 dark:text-slate-400 leading-relaxed"
                  >
                    {paragraph}
                  </p>
                ))}
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* Skills Section */}
        <section className="mb-24 lg:mb-32">
          <ScrollReveal>
            <SectionHeading
              title="Skills & Expertise"
              subtitle="Technologies and tools I work with daily"
            />
          </ScrollReveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {skillCategories.map((cat, i) => (
              <ScrollReveal key={cat.category} delay={i * 0.1}>
                <SkillBar
                  category={cat.category}
                  icon={cat.icon}
                  skills={cat.skills}
                />
              </ScrollReveal>
            ))}
          </div>
        </section>

        {/* Timeline Section */}
        <section>
          <ScrollReveal>
            <SectionHeading
              title="Experience"
              subtitle="My professional journey so far"
            />
          </ScrollReveal>

          <Timeline />
        </section>
      </div>
    </div>
  )
}
