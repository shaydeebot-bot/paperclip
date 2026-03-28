'use client'

import { useState, FormEvent } from 'react'
import { Send, Loader2, CheckCircle, AlertCircle } from 'lucide-react'
import Button from '@/components/ui/Button'

interface FormErrors {
  name?: string
  email?: string
  subject?: string
  message?: string
}

export default function ContactForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    website: '',
  })
  const [errors, setErrors] = useState<FormErrors>({})
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  const validate = (): boolean => {
    const newErrors: FormErrors = {}

    if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters'
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }
    if (formData.subject.trim().length < 5) {
      newErrors.subject = 'Subject must be at least 5 characters'
    }
    if (formData.message.trim().length < 20) {
      newErrors.message = 'Message must be at least 20 characters'
    }
    if (formData.message.trim().length > 2000) {
      newErrors.message = 'Message must be under 2000 characters'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    setStatus('loading')
    setErrorMessage('')

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.message || 'Failed to send message')
      }

      setStatus('success')
      setFormData({ name: '', email: '', subject: '', message: '', website: '' })
    } catch (err) {
      setStatus('error')
      setErrorMessage(
        err instanceof Error ? err.message : 'Failed to send message. Please try again.'
      )
    }
  }

  const inputBase =
    'w-full px-4 py-3 rounded-btn bg-white dark:bg-slate-800/50 border text-slate-900 dark:text-white font-body text-sm placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200'

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      {/* Honeypot — bots fill this hidden field; the server rejects submissions that include it */}
      <div className="absolute -left-[9999px]" aria-hidden="true">
        <label htmlFor="website">Website</label>
        <input
          type="text"
          id="website"
          name="website"
          tabIndex={-1}
          autoComplete="off"
          value={formData.website}
          onChange={(e) => setFormData({ ...formData, website: e.target.value })}
        />
      </div>

      {/* Status messages */}
      {status === 'success' && (
        <div className="flex items-center gap-3 p-4 rounded-btn bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-400" role="alert">
          <CheckCircle size={18} />
          <p className="text-sm font-body">Message sent! I&apos;ll get back to you soon.</p>
        </div>
      )}

      {status === 'error' && (
        <div className="flex items-center gap-3 p-4 rounded-btn bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-700 dark:text-red-400" role="alert">
          <AlertCircle size={18} />
          <p className="text-sm font-body">{errorMessage}</p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* Name */}
        <div>
          <label htmlFor="name" className="block text-sm font-body font-medium text-slate-700 dark:text-slate-300 mb-2">
            Name
          </label>
          <input
            type="text"
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className={`${inputBase} ${errors.name ? 'border-red-400 dark:border-red-400' : 'border-slate-200 dark:border-slate-700'}`}
            placeholder="Jane Doe"
            aria-invalid={!!errors.name}
            aria-describedby={errors.name ? 'name-error' : undefined}
          />
          {errors.name && (
            <p id="name-error" className="mt-1.5 text-xs text-red-500 font-body" role="alert">
              {errors.name}
            </p>
          )}
        </div>

        {/* Email */}
        <div>
          <label htmlFor="email" className="block text-sm font-body font-medium text-slate-700 dark:text-slate-300 mb-2">
            Email
          </label>
          <input
            type="email"
            id="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className={`${inputBase} ${errors.email ? 'border-red-400 dark:border-red-400' : 'border-slate-200 dark:border-slate-700'}`}
            placeholder="jane@example.com"
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? 'email-error' : undefined}
          />
          {errors.email && (
            <p id="email-error" className="mt-1.5 text-xs text-red-500 font-body" role="alert">
              {errors.email}
            </p>
          )}
        </div>
      </div>

      {/* Subject */}
      <div>
        <label htmlFor="subject" className="block text-sm font-body font-medium text-slate-700 dark:text-slate-300 mb-2">
          Subject
        </label>
        <input
          type="text"
          id="subject"
          value={formData.subject}
          onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
          className={`${inputBase} ${errors.subject ? 'border-red-400 dark:border-red-400' : 'border-slate-200 dark:border-slate-700'}`}
          placeholder="Project Inquiry"
          aria-invalid={!!errors.subject}
          aria-describedby={errors.subject ? 'subject-error' : undefined}
        />
        {errors.subject && (
          <p id="subject-error" className="mt-1.5 text-xs text-red-500 font-body" role="alert">
            {errors.subject}
          </p>
        )}
      </div>

      {/* Message */}
      <div>
        <label htmlFor="message" className="block text-sm font-body font-medium text-slate-700 dark:text-slate-300 mb-2">
          Message
        </label>
        <textarea
          id="message"
          rows={6}
          value={formData.message}
          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
          className={`${inputBase} resize-y ${errors.message ? 'border-red-400 dark:border-red-400' : 'border-slate-200 dark:border-slate-700'}`}
          placeholder="Tell me about your project..."
          aria-invalid={!!errors.message}
          aria-describedby={errors.message ? 'message-error' : undefined}
        />
        <div className="flex items-center justify-between mt-1.5">
          {errors.message ? (
            <p id="message-error" className="text-xs text-red-500 font-body" role="alert">
              {errors.message}
            </p>
          ) : (
            <span />
          )}
          <span className="text-xs text-slate-400 font-mono">
            {formData.message.length}/2000
          </span>
        </div>
      </div>

      <p className="text-xs text-slate-400 dark:text-slate-500 font-body leading-relaxed">
        By submitting this form you agree that your name, email address, and message will be used
        to respond to your inquiry and processed via{' '}
        <a
          href="https://resend.com/legal/privacy-policy"
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
        >
          Resend
        </a>{' '}
        for email delivery. See the{' '}
        <a href="/privacy" className="underline hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
          Privacy Policy
        </a>{' '}
        for details.
      </p>

      <Button type="submit" disabled={status === 'loading'} className="w-full sm:w-auto">
        {status === 'loading' ? (
          <>
            <Loader2 size={16} className="animate-spin" />
            Sending...
          </>
        ) : (
          <>
            <Send size={16} />
            Send Message
          </>
        )}
      </Button>
    </form>
  )
}
