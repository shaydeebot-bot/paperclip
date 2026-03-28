'use client'

import Link from 'next/link'
import { ArrowRight, ExternalLink, Github } from 'lucide-react'
import SectionHeading from '@/components/ui/SectionHeading'
import ScrollReveal from '@/components/ui/ScrollReveal'
import Tag from '@/components/ui/Tag'
import { projects } from '@/content/projects'

const featured = projects.filter((p) => p.featured).sort((a, b) => a.order - b.order)

export default function FeaturedProjects() {
  return (
    <section className="py-24 lg:py-32">
      <div className="max-w-6xl mx-auto px-6">
        <ScrollReveal>
          <SectionHeading
            title="Featured Work"
            subtitle="A selection of projects I'm most proud of"
          />
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featured.map((project, i) => (
            <ScrollReveal key={project.id} delay={i * 0.1}>
              <div className="group relative bg-white dark:bg-slate-800/50 rounded-card border border-slate-200 dark:border-slate-700/50 overflow-hidden hover:shadow-xl hover:shadow-slate-200/50 dark:hover:shadow-slate-900/50 transition-all duration-500 hover:-translate-y-1">
                {/* Image */}
                <div className="relative aspect-video bg-gradient-to-br from-primary/10 via-violet-500/10 to-accent/10 overflow-hidden">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="font-display font-bold text-4xl text-primary/20">
                      {project.title[0]}
                    </span>
                  </div>
                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-slate-900/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-4">
                    {project.liveUrl && (
                      <a
                        href={project.liveUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-10 h-10 flex items-center justify-center rounded-full bg-white text-slate-900 hover:bg-primary hover:text-white transition-colors"
                        aria-label={`View ${project.title} live`}
                      >
                        <ExternalLink size={16} />
                      </a>
                    )}
                    {project.githubUrl && (
                      <a
                        href={project.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-10 h-10 flex items-center justify-center rounded-full bg-white text-slate-900 hover:bg-primary hover:text-white transition-colors"
                        aria-label={`View ${project.title} source code`}
                      >
                        <Github size={16} />
                      </a>
                    )}
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <h3 className="font-display font-bold text-lg text-slate-900 dark:text-white mb-2">
                    {project.title}
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 font-body line-clamp-2 mb-4">
                    {project.description}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {project.tags.slice(0, 3).map((tag) => (
                      <Tag key={tag}>{tag}</Tag>
                    ))}
                    {project.tags.length > 3 && (
                      <Tag>+{project.tags.length - 3}</Tag>
                    )}
                  </div>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>

        <ScrollReveal delay={0.3}>
          <div className="mt-12 text-center">
            <Link
              href="/projects"
              className="inline-flex items-center gap-2 text-primary font-body font-medium text-sm hover:gap-3 transition-all duration-300"
            >
              View All Projects
              <ArrowRight size={16} />
            </Link>
          </div>
        </ScrollReveal>
      </div>
    </section>
  )
}
