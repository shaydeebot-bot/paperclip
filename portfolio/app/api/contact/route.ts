import { NextRequest, NextResponse } from 'next/server'
import { resend } from '@/lib/resend'

const rateLimit = new Map<string, { count: number; resetAt: number }>()
const RATE_LIMIT_MAX = 3
const RATE_LIMIT_WINDOW = 15 * 60 * 1000 // 15 minutes

function isRateLimited(ip: string): boolean {
  const now = Date.now()
  const entry = rateLimit.get(ip)

  if (!entry || now > entry.resetAt) {
    rateLimit.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW })
    return false
  }

  if (entry.count >= RATE_LIMIT_MAX) {
    return true
  }

  entry.count++
  return false
}

function validateField(value: string, name: string, min: number, max: number) {
  const trimmed = value?.trim()
  if (!trimmed) return `${name} is required`
  if (trimmed.length < min) return `${name} must be at least ${min} characters`
  if (trimmed.length > max) return `${name} must be under ${max} characters`
  return null
}

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'

  if (isRateLimited(ip)) {
    return NextResponse.json(
      { success: false, message: 'Too many requests. Please try again later.' },
      { status: 429 }
    )
  }

  try {
    const body = await request.json()
    const { name, email, subject, message } = body

    // Validation
    const errors: Record<string, string> = {}

    const nameErr = validateField(name, 'Name', 2, 100)
    if (nameErr) errors.name = nameErr

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!email?.trim()) {
      errors.email = 'Email is required'
    } else if (!emailRegex.test(email.trim())) {
      errors.email = 'Invalid email address'
    }

    const subjectErr = validateField(subject, 'Subject', 5, 200)
    if (subjectErr) errors.subject = subjectErr

    const messageErr = validateField(message, 'Message', 20, 2000)
    if (messageErr) errors.message = messageErr

    if (Object.keys(errors).length > 0) {
      return NextResponse.json(
        { success: false, errors },
        { status: 400 }
      )
    }

    const contactEmail = process.env.CONTACT_EMAIL
    if (!contactEmail) {
      console.error('CONTACT_EMAIL environment variable not set')
      return NextResponse.json(
        { success: false, message: 'Server configuration error' },
        { status: 500 }
      )
    }

    await resend.emails.send({
      from: 'Portfolio Contact <onboarding@resend.dev>',
      to: contactEmail,
      replyTo: email.trim(),
      subject: `[Portfolio Contact] ${subject.trim()}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1e293b;">New Contact Form Submission</h2>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; color: #64748b; width: 100px;">Name</td>
              <td style="padding: 8px 0; color: #1e293b; font-weight: 500;">${name.trim()}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #64748b;">Email</td>
              <td style="padding: 8px 0;"><a href="mailto:${email.trim()}" style="color: #6366f1;">${email.trim()}</a></td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #64748b;">Subject</td>
              <td style="padding: 8px 0; color: #1e293b;">${subject.trim()}</td>
            </tr>
          </table>
          <div style="margin-top: 16px; padding: 16px; background: #f8fafc; border-radius: 8px;">
            <p style="color: #64748b; font-size: 12px; margin: 0 0 8px;">Message</p>
            <p style="color: #1e293b; line-height: 1.6; margin: 0; white-space: pre-wrap;">${message.trim()}</p>
          </div>
          <p style="margin-top: 16px; color: #94a3b8; font-size: 12px;">
            Sent from portfolio contact form at ${new Date().toISOString()}
          </p>
        </div>
      `,
    })

    return NextResponse.json({ success: true, message: 'Message sent successfully' })
  } catch (error) {
    console.error('Contact form error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to send message. Please try again.' },
      { status: 500 }
    )
  }
}
