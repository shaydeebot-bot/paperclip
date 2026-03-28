'use client'

import { motion } from 'framer-motion'
import { ExternalLink, Github } from 'lucide-react'
import Tag from '@/components/ui/Tag'
import { Project } from '@/lib/types'

interface ProjectCardProps {
  project: Project
  index: number
}

export default function ProjectCard({ project, index }: ProjectCardProps) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      className="group relative bg-white dark:bg-slate-800/50 rounded-card border border-slate-200 dark:border-slate-700/50 overflow-hidden hover:shadow-xl hover:shadow-slate-200/50 dark:hover:shadow-slate-900/50 transition-all duration-500 hover:-translate-y-1"
    >
      {/* Image */}
      <div className="relative aspect-video bg-gradient-to-br from-primary/10 via-violet-500/10 to-accent/10 overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="font-display font-bold text-5xl text-primary/20 group-hover:scale-110 transition-transform duration-500">
            {project.title[0]}
          </span>
        </div>
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
          {project.tags.map((tag) => (
            <Tag key={tag}>{tag}</Tag>
          ))}
        </div>
      </div>
    </motion.div>
  )
}
