'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, Quote } from 'lucide-react'
import SectionHeading from '@/components/ui/SectionHeading'
import ScrollReveal from '@/components/ui/ScrollReveal'
import { testimonials } from '@/content/testimonials'

export default function Testimonials() {
  const [current, setCurrent] = useState(0)
  const [paused, setPaused] = useState(false)

  const next = useCallback(() => {
    setCurrent((prev) => (prev + 1) % testimonials.length)
  }, [])

  const prev = () => {
    setCurrent(
      (prev) => (prev - 1 + testimonials.length) % testimonials.length
    )
  }

  useEffect(() => {
    if (paused) return
    const timer = setInterval(next, 5000)
    return () => clearInterval(timer)
  }, [paused, next])

  const t = testimonials[current]

  return (
    <section className="py-24 lg:py-32 bg-slate-50 dark:bg-slate-800/30">
      <div className="max-w-4xl mx-auto px-6">
        <ScrollReveal>
          <SectionHeading
            title="What Clients Say"
            subtitle="Feedback from people I've had the pleasure of working with"
          />
        </ScrollReveal>

        <ScrollReveal delay={0.2}>
          <div
            className="relative"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
          >
            <div className="min-h-[280px] flex items-center">
              <AnimatePresence mode="wait">
                <motion.div
                  key={current}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.4 }}
                  className="text-center"
                >
                  <Quote className="mx-auto mb-6 text-primary/30" size={48} />
                  <blockquote className="text-xl sm:text-2xl font-body font-light text-slate-700 dark:text-slate-300 leading-relaxed italic mb-8">
                    &ldquo;{t.quote}&rdquo;
                  </blockquote>

                  <div>
                    <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-display font-bold text-lg">
                      {t.name[0]}
                    </div>
                    <p className="font-display font-semibold text-slate-900 dark:text-white">
                      {t.name}
                    </p>
                    <p className="text-sm text-slate-500 dark:text-slate-400 font-body">
                      {t.role}
                    </p>
                  </div>

                  {t.rating && (
                    <div className="mt-3 flex items-center justify-center gap-1">
                      {Array.from({ length: t.rating }).map((_, i) => (
                        <svg
                          key={i}
                          className="w-4 h-4 text-amber-400"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Navigation arrows */}
            <button
              onClick={prev}
              className="hidden sm:flex absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 w-10 h-10 items-center justify-center rounded-full bg-white dark:bg-slate-800 shadow-md text-slate-600 dark:text-slate-400 hover:text-primary transition-colors"
              aria-label="Previous testimonial"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={next}
              className="hidden sm:flex absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 w-10 h-10 items-center justify-center rounded-full bg-white dark:bg-slate-800 shadow-md text-slate-600 dark:text-slate-400 hover:text-primary transition-colors"
              aria-label="Next testimonial"
            >
              <ChevronRight size={18} />
            </button>

            {/* Dots */}
            <div className="flex items-center justify-center gap-2 mt-8">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrent(i)}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    i === current
                      ? 'bg-primary w-6'
                      : 'bg-slate-300 dark:bg-slate-600 hover:bg-slate-400'
                  }`}
                  aria-label={`Go to testimonial ${i + 1}`}
                />
              ))}
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  )
}
