'use client'

import { useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import { useSearchParams, useRouter } from 'next/navigation'
import ProjectFilter from '@/components/projects/ProjectFilter'
import ProjectCard from '@/components/projects/ProjectCard'
import { projects } from '@/content/projects'

export default function ProjectGallery() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const initialCategory = searchParams.get('category') || 'all'
  const [category, setCategory] = useState(initialCategory)

  const filtered =
    category === 'all'
      ? projects
      : projects.filter((p) => p.category === category)

  const handleFilter = (cat: string) => {
    setCategory(cat)
    const params = new URLSearchParams()
    if (cat !== 'all') params.set('category', cat)
    router.replace(`/projects${params.toString() ? `?${params}` : ''}`, {
      scroll: false,
    })
  }

  return (
    <>
      <ProjectFilter active={category} onChange={handleFilter} />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        <AnimatePresence mode="popLayout">
          {filtered
            .sort((a, b) => a.order - b.order)
            .map((project, i) => (
              <ProjectCard key={project.id} project={project} index={i} />
            ))}
        </AnimatePresence>
      </div>
    </>
  )
}
