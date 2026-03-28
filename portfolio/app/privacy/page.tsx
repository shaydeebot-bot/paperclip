import { Metadata } from 'next'
import Link from 'next/link'
import { siteConfig } from '@/lib/config'

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'How your personal information is collected, used, and protected when you use this website.',
  robots: { index: true, follow: true },
}

const LAST_UPDATED = 'March 28, 2026'

export default function PrivacyPage() {
  return (
    <div className="py-24 lg:py-32">
      <div className="max-w-3xl mx-auto px-6">
        <header className="mb-12">
          <h1 className="font-display font-bold text-4xl lg:text-5xl text-slate-900 dark:text-white mb-4">
            Privacy Policy
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-body">
            Last updated: {LAST_UPDATED}
          </p>
        </header>

        <div className="prose prose-slate dark:prose-invert max-w-none font-body space-y-10">

          <section>
            <h2 className="font-display font-semibold text-2xl text-slate-900 dark:text-white mb-4">
              Overview
            </h2>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              This website is operated by {siteConfig.name}, a freelance web developer. This
              Privacy Policy explains what personal information is collected when you visit this
              site, how it is used, and your rights regarding that information.
            </p>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed mt-3">
              This is a personal portfolio website. It has no user accounts, no e-commerce, and no
              persistent database. The only way personal data enters this system is when you
              voluntarily submit the contact form.
            </p>
          </section>

          <section>
            <h2 className="font-display font-semibold text-2xl text-slate-900 dark:text-white mb-4">
              What Information Is Collected
            </h2>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
              When you submit the contact form on this website, the following information is
              collected:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-slate-600 dark:text-slate-400">
              <li><strong className="text-slate-800 dark:text-slate-200">Name</strong> — so your message can be addressed appropriately</li>
              <li><strong className="text-slate-800 dark:text-slate-200">Email address</strong> — to reply to your inquiry</li>
              <li><strong className="text-slate-800 dark:text-slate-200">Subject</strong> — to understand the nature of your inquiry</li>
              <li><strong className="text-slate-800 dark:text-slate-200">Message</strong> — the content of your inquiry</li>
            </ul>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed mt-4">
              No other personal information is collected. This website does not use analytics,
              tracking pixels, advertising scripts, or fingerprinting technologies.
            </p>
          </section>

          <section>
            <h2 className="font-display font-semibold text-2xl text-slate-900 dark:text-white mb-4">
              How Your Information Is Used
            </h2>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              Contact form submissions are used solely to respond to your inquiry. Your information
              will not be used for marketing, sold to third parties, shared with anyone outside of
              what is necessary to deliver a reply, or used for any purpose other than responding
              to your message.
            </p>
          </section>

          <section>
            <h2 className="font-display font-semibold text-2xl text-slate-900 dark:text-white mb-4">
              How Information Is Transmitted
            </h2>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
              When you submit the contact form, your name, email address, subject, and message are
              transmitted securely over HTTPS to this website&apos;s server-side API. The information
              is then forwarded as an email via{' '}
              <strong className="text-slate-800 dark:text-slate-200">Resend</strong>, an email
              delivery service, to {siteConfig.name}&apos;s inbox.
            </p>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              Resend acts as a data processor on behalf of this website. Your contact form data
              passes through Resend&apos;s infrastructure solely for the purpose of delivering the
              email. Resend&apos;s own privacy policy is available at{' '}
              <a
                href="https://resend.com/legal/privacy-policy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                resend.com/legal/privacy-policy
              </a>
              .
            </p>
          </section>

          <section>
            <h2 className="font-display font-semibold text-2xl text-slate-900 dark:text-white mb-4">
              Cookies and Local Storage
            </h2>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              This website does not set any cookies.
            </p>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed mt-3">
              The dark/light mode toggle stores your theme preference (
              <code className="text-xs bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                theme
              </code>
              ) in your browser&apos;s{' '}
              <code className="text-xs bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                localStorage
              </code>
              . This value never leaves your device and is not transmitted to any server. It
              contains no personal information.
            </p>
          </section>

          <section>
            <h2 className="font-display font-semibold text-2xl text-slate-900 dark:text-white mb-4">
              Third-Party Services
            </h2>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
              This website uses the following third-party services:
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-slate-600 dark:text-slate-400 border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-700">
                    <th className="text-left py-3 pr-4 font-semibold text-slate-800 dark:text-slate-200">Service</th>
                    <th className="text-left py-3 pr-4 font-semibold text-slate-800 dark:text-slate-200">Purpose</th>
                    <th className="text-left py-3 font-semibold text-slate-800 dark:text-slate-200">Data shared</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  <tr>
                    <td className="py-3 pr-4 font-medium text-slate-800 dark:text-slate-300">Resend</td>
                    <td className="py-3 pr-4">Email delivery</td>
                    <td className="py-3">Contact form fields (name, email, subject, message)</td>
                  </tr>
                  <tr>
                    <td className="py-3 pr-4 font-medium text-slate-800 dark:text-slate-300">Google Fonts (self-hosted)</td>
                    <td className="py-3 pr-4">Typography (Syne, Outfit, JetBrains Mono)</td>
                    <td className="py-3">Font files are self-hosted via Next.js. No requests are made to Google&apos;s servers at runtime.</td>
                  </tr>
                  <tr>
                    <td className="py-3 pr-4 font-medium text-slate-800 dark:text-slate-300">Vercel</td>
                    <td className="py-3 pr-4">Website hosting and deployment</td>
                    <td className="py-3">Standard HTTP request data (IP address, browser, pages visited) retained per Vercel&apos;s own policy for infrastructure purposes.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2 className="font-display font-semibold text-2xl text-slate-900 dark:text-white mb-4">
              Data Retention
            </h2>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              Contact form submissions are retained in {siteConfig.name}&apos;s email inbox for as long
              as necessary to respond to and manage the inquiry, typically no longer than 12 months.
              Emails are deleted after this period unless there is an ongoing business relationship
              or a legal reason to retain them.
            </p>
          </section>

          <section>
            <h2 className="font-display font-semibold text-2xl text-slate-900 dark:text-white mb-4">
              Legal Basis for Processing (GDPR)
            </h2>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              If you are located in the European Economic Area (EEA), the legal basis for processing
              your contact form data is <strong className="text-slate-800 dark:text-slate-200">
              legitimate interest</strong> (Article 6(1)(f) GDPR) — specifically, the legitimate
              interest in being able to receive and respond to business inquiries submitted
              voluntarily by the data subject. This processing is necessary to fulfill the purpose
              for which you provided the information. You may object to this processing at any time
              (see Your Rights below).
            </p>
          </section>

          <section>
            <h2 className="font-display font-semibold text-2xl text-slate-900 dark:text-white mb-4">
              Your Rights
            </h2>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
              Depending on your location, you may have the following rights regarding your personal
              information:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-slate-600 dark:text-slate-400">
              <li><strong className="text-slate-800 dark:text-slate-200">Access</strong> — request a copy of the personal information held about you</li>
              <li><strong className="text-slate-800 dark:text-slate-200">Rectification</strong> — request correction of inaccurate information</li>
              <li><strong className="text-slate-800 dark:text-slate-200">Erasure</strong> — request deletion of your personal information</li>
              <li><strong className="text-slate-800 dark:text-slate-200">Objection</strong> — object to processing based on legitimate interest</li>
              <li><strong className="text-slate-800 dark:text-slate-200">Portability</strong> — request your data in a structured, machine-readable format</li>
            </ul>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed mt-4">
              To exercise any of these rights, email{' '}
              <a
                href={`mailto:${siteConfig.email}`}
                className="text-primary hover:underline"
              >
                {siteConfig.email}
              </a>{' '}
              with the subject line &quot;Privacy Request.&quot; Requests will be acknowledged within
              10 business days and fulfilled within 30 days (GDPR) or 45 days (CCPA), as applicable.
            </p>
          </section>

          <section>
            <h2 className="font-display font-semibold text-2xl text-slate-900 dark:text-white mb-4">
              Children&apos;s Privacy
            </h2>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              This website is not directed at children under 13. No information is knowingly
              collected from children under 13. If you believe a child has submitted information
              via the contact form, please email{' '}
              <a href={`mailto:${siteConfig.email}`} className="text-primary hover:underline">
                {siteConfig.email}
              </a>{' '}
              and it will be promptly deleted.
            </p>
          </section>

          <section>
            <h2 className="font-display font-semibold text-2xl text-slate-900 dark:text-white mb-4">
              Changes to This Policy
            </h2>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              This policy may be updated occasionally. When updated, the &quot;Last updated&quot; date at
              the top of this page will change. Continued use of the contact form after a policy
              update constitutes acceptance of the updated terms.
            </p>
          </section>

          <section>
            <h2 className="font-display font-semibold text-2xl text-slate-900 dark:text-white mb-4">
              Contact
            </h2>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              Questions about this Privacy Policy or how your data is handled should be sent to:
            </p>
            <address className="mt-3 not-italic text-slate-600 dark:text-slate-400 space-y-1">
              <p className="font-medium text-slate-800 dark:text-slate-200">{siteConfig.name}</p>
              <p>{siteConfig.location}</p>
              <p>
                <a href={`mailto:${siteConfig.email}`} className="text-primary hover:underline">
                  {siteConfig.email}
                </a>
              </p>
            </address>
          </section>

        </div>

        <div className="mt-16 pt-8 border-t border-slate-200 dark:border-slate-800">
          <p className="text-sm text-slate-500 dark:text-slate-400 font-body">
            See also:{' '}
            <Link href="/terms" className="text-primary hover:underline">
              Terms of Service
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
