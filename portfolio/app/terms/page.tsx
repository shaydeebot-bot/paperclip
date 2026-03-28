import { Metadata } from 'next'
import Link from 'next/link'
import { siteConfig } from '@/lib/config'

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'Terms governing your use of this website.',
  robots: { index: true, follow: true },
}

const LAST_UPDATED = 'March 28, 2026'

export default function TermsPage() {
  return (
    <div className="py-24 lg:py-32">
      <div className="max-w-3xl mx-auto px-6">
        <header className="mb-12">
          <h1 className="font-display font-bold text-4xl lg:text-5xl text-slate-900 dark:text-white mb-4">
            Terms of Service
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-body">
            Last updated: {LAST_UPDATED}
          </p>
        </header>

        <div className="font-body space-y-10">

          <section>
            <h2 className="font-display font-semibold text-2xl text-slate-900 dark:text-white mb-4">
              Acceptance of Terms
            </h2>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              By accessing or using this website (&quot;Site&quot;), you agree to be bound by these Terms
              of Service. If you do not agree, please do not use the Site. The Site is operated
              by {siteConfig.name}, a freelance web developer based in {siteConfig.location}.
            </p>
          </section>

          <section>
            <h2 className="font-display font-semibold text-2xl text-slate-900 dark:text-white mb-4">
              Use of the Site
            </h2>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
              You may use this Site for lawful purposes only. You agree not to:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-slate-600 dark:text-slate-400">
              <li>Use the contact form to send spam, unsolicited commercial messages, or abusive content</li>
              <li>Attempt to gain unauthorized access to any part of the Site or its underlying systems</li>
              <li>Use automated tools to scrape, crawl, or extract content from the Site without prior written permission</li>
              <li>Impersonate any person or entity in contact form submissions</li>
              <li>Submit false, misleading, or harmful content through the contact form</li>
              <li>Engage in any activity that could damage, disable, or impair the Site&apos;s functionality</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display font-semibold text-2xl text-slate-900 dark:text-white mb-4">
              Intellectual Property
            </h2>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              All content on this Site — including but not limited to text, blog posts, code
              samples, project descriptions, images, and design — is the property of{' '}
              {siteConfig.name} and is protected by applicable copyright and intellectual property
              laws. You may not reproduce, distribute, modify, or create derivative works from any
              content on this Site without prior written permission.
            </p>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed mt-3">
              <strong className="text-slate-800 dark:text-slate-200">Exception:</strong> Code
              samples published in blog posts may be used freely for personal and commercial
              projects unless otherwise noted in the post itself.
            </p>
          </section>

          <section>
            <h2 className="font-display font-semibold text-2xl text-slate-900 dark:text-white mb-4">
              Blog Content and Technical Accuracy
            </h2>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              Blog posts represent the personal opinions and experiences of {siteConfig.name} at
              the time of writing. Technology evolves rapidly; information in older posts may be
              outdated. Always verify technical information against current official documentation
              before applying it in a production environment. No warranty is made as to the
              accuracy, completeness, or fitness for purpose of any blog content.
            </p>
          </section>

          <section>
            <h2 className="font-display font-semibold text-2xl text-slate-900 dark:text-white mb-4">
              Contact Form
            </h2>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              Submitting the contact form does not create a business relationship, contract, or
              obligation of any kind. Receipt of a form submission does not guarantee a response.
              {siteConfig.name} reserves the right to decline, ignore, or not respond to any
              inquiry at their discretion.
            </p>
          </section>

          <section>
            <h2 className="font-display font-semibold text-2xl text-slate-900 dark:text-white mb-4">
              Disclaimer of Warranties
            </h2>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              THIS SITE IS PROVIDED &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot; WITHOUT WARRANTIES OF ANY KIND,
              EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO WARRANTIES OF
              MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, OR NON-INFRINGEMENT.{' '}
              {siteConfig.name.toUpperCase()} DOES NOT WARRANT THAT THE SITE WILL BE
              UNINTERRUPTED, ERROR-FREE, OR FREE OF HARMFUL COMPONENTS.
            </p>
          </section>

          <section>
            <h2 className="font-display font-semibold text-2xl text-slate-900 dark:text-white mb-4">
              Limitation of Liability
            </h2>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, {siteConfig.name.toUpperCase()}{' '}
              SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE
              DAMAGES ARISING FROM YOUR USE OF, OR INABILITY TO USE, THIS SITE OR ITS CONTENT.
              THIS INCLUDES BUT IS NOT LIMITED TO DAMAGES FOR LOSS OF PROFITS, DATA, GOODWILL, OR
              OTHER INTANGIBLE LOSSES, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGES.
            </p>
          </section>

          <section>
            <h2 className="font-display font-semibold text-2xl text-slate-900 dark:text-white mb-4">
              External Links
            </h2>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              This Site may contain links to third-party websites. These links are provided for
              convenience only. {siteConfig.name} has no control over, and accepts no responsibility
              for, the content, privacy practices, or terms of any linked site. Visiting external
              links is at your own risk.
            </p>
          </section>

          <section>
            <h2 className="font-display font-semibold text-2xl text-slate-900 dark:text-white mb-4">
              Open Source
            </h2>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              This portfolio site is built with open-source software including Next.js, React,
              Tailwind CSS, and other packages listed in{' '}
              <code className="text-xs bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                package.json
              </code>
              . Those packages are governed by their respective licenses. The portfolio&apos;s own
              source code is the property of {siteConfig.name} and is not open-sourced unless
              explicitly stated otherwise.
            </p>
          </section>

          <section>
            <h2 className="font-display font-semibold text-2xl text-slate-900 dark:text-white mb-4">
              Governing Law
            </h2>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              These Terms are governed by the laws of the State of California, United States, without
              regard to its conflict of law provisions. Any disputes arising under these Terms shall
              be subject to the exclusive jurisdiction of the state and federal courts located in
              San Francisco County, California.
            </p>
          </section>

          <section>
            <h2 className="font-display font-semibold text-2xl text-slate-900 dark:text-white mb-4">
              Changes to These Terms
            </h2>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              These Terms may be updated at any time. The &quot;Last updated&quot; date at the top of this
              page will reflect any changes. Continued use of the Site after changes are posted
              constitutes acceptance of the updated Terms.
            </p>
          </section>

          <section>
            <h2 className="font-display font-semibold text-2xl text-slate-900 dark:text-white mb-4">
              Contact
            </h2>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              Questions about these Terms should be sent to:
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
            <Link href="/privacy" className="text-primary hover:underline">
              Privacy Policy
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
