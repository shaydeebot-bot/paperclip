'use client'

import { motion } from 'framer-motion'

interface Skill {
  name: string
  level: number
}

interface SkillBarProps {
  category: string
  icon: React.ReactNode
  skills: Skill[]
}

export default function SkillBar({ category, icon, skills }: SkillBarProps) {
  return (
    <div className="bg-white dark:bg-slate-800/50 rounded-card border border-slate-200 dark:border-slate-700/50 p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 flex items-center justify-center rounded-btn bg-primary/10 text-primary">
          {icon}
        </div>
        <h3 className="font-display font-bold text-lg text-slate-900 dark:text-white">
          {category}
        </h3>
      </div>
      <div className="space-y-4">
        {skills.map((skill) => (
          <div key={skill.name}>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-sm font-body text-slate-700 dark:text-slate-300">
                {skill.name}
              </span>
              <span className="text-xs font-mono text-slate-400 dark:text-slate-500">
                {skill.level}%
              </span>
            </div>
            <div className="h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                whileInView={{ width: `${skill.level}%` }}
                viewport={{ once: true }}
                transition={{ duration: 1, delay: 0.2, ease: 'easeOut' }}
                className="h-full rounded-full bg-gradient-to-r from-primary to-accent"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
