import { Metadata } from 'next'
import { Suspense } from 'react'
import SectionHeading from '@/components/ui/SectionHeading'
import ProjectGallery from '@/components/projects/ProjectGallery'
import { siteConfig } from '@/lib/config'

export const metadata: Metadata = {
  title: 'Projects',
  description: `A showcase of ${siteConfig.name}'s web development work across web, mobile, and design.`,
}

export default function ProjectsPage() {
  return (
    <div className="py-24 lg:py-32">
      <div className="max-w-6xl mx-auto px-6">
        <SectionHeading
          title="My Projects"
          subtitle="A curated collection of work spanning web development, mobile apps, and design"
        />

        <Suspense
          fallback={
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="bg-slate-100 dark:bg-slate-800/50 rounded-card h-80 animate-pulse"
                />
              ))}
            </div>
          }
        >
          <ProjectGallery />
        </Suspense>
      </div>
    </div>
  )
}
