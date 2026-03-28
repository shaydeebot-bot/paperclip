'use client'

import { motion } from 'framer-motion'
import { ArrowDown } from 'lucide-react'
import Button from '@/components/ui/Button'
import { siteConfig } from '@/lib/config'

export default function Hero() {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
      {/* Animated gradient orbs */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full bg-primary/20 dark:bg-primary/10 blur-[100px] animate-float" />
        <div
          className="absolute -bottom-40 -left-40 w-[400px] h-[400px] rounded-full bg-accent/20 dark:bg-accent/10 blur-[100px] animate-float"
          style={{ animationDelay: '-3s' }}
        />
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-violet-500/10 dark:bg-violet-500/5 blur-[120px] animate-float"
          style={{ animationDelay: '-1.5s' }}
        />
      </div>

      {/* Grid pattern overlay */}
      <div
        className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]"
        style={{
          backgroundImage: `linear-gradient(rgba(99,102,241,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.3) 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
        }}
      />

      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.21, 0.47, 0.32, 0.98] }}
        >
          <p className="text-primary font-body font-medium text-sm tracking-[0.2em] uppercase mb-6">
            {siteConfig.role}
          </p>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.8,
            delay: 0.15,
            ease: [0.21, 0.47, 0.32, 0.98],
          }}
          className="font-display font-extrabold text-5xl sm:text-6xl lg:text-7xl xl:text-8xl text-slate-900 dark:text-white tracking-tight leading-[0.95]"
        >
          {siteConfig.name.split(' ')[0]}
          <br />
          <span className="bg-gradient-to-r from-primary via-violet-500 to-accent bg-clip-text text-transparent">
            {siteConfig.name.split(' ').slice(1).join(' ')}
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.8,
            delay: 0.3,
            ease: [0.21, 0.47, 0.32, 0.98],
          }}
          className="mt-8 text-lg sm:text-xl text-slate-600 dark:text-slate-400 font-body leading-relaxed max-w-2xl mx-auto"
        >
          {siteConfig.tagline} I build performant, accessible web applications
          that delight users and drive results.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.8,
            delay: 0.45,
            ease: [0.21, 0.47, 0.32, 0.98],
          }}
          className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Button href="/projects">View My Work</Button>
          <Button href="/contact" variant="secondary">
            Get In Touch
          </Button>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.8 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="text-slate-400 dark:text-slate-500"
        >
          <ArrowDown size={20} />
        </motion.div>
      </motion.div>
    </section>
  )
}
