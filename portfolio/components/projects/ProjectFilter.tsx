'use client'

import Tag from '@/components/ui/Tag'
import { ProjectCategory } from '@/lib/types'

const categories: { label: string; value: ProjectCategory | 'all' }[] = [
  { label: 'All', value: 'all' },
  { label: 'Web', value: 'web' },
  { label: 'Mobile', value: 'mobile' },
  { label: 'Design', value: 'design' },
]

interface ProjectFilterProps {
  active: string
  onChange: (category: string) => void
}

export default function ProjectFilter({ active, onChange }: ProjectFilterProps) {
  return (
    <div className="flex flex-wrap items-center gap-3 mb-12">
      {categories.map((cat) => (
        <Tag
          key={cat.value}
          active={active === cat.value}
          onClick={() => onChange(cat.value)}
        >
          {cat.label}
        </Tag>
      ))}
    </div>
  )
}
