import { Metadata } from 'next'
import { Mail, Github, Linkedin, Twitter } from 'lucide-react'
import SectionHeading from '@/components/ui/SectionHeading'
import ContactForm from '@/components/contact/ContactForm'
import ScrollReveal from '@/components/ui/ScrollReveal'
import { siteConfig } from '@/lib/config'

export const metadata: Metadata = {
  title: 'Contact',
  description: `Get in touch with ${siteConfig.name} for project inquiries, collaborations, or just to say hello.`,
}

const socialLinks = [
  { href: siteConfig.social.github, icon: Github, label: 'GitHub' },
  { href: siteConfig.social.linkedin, icon: Linkedin, label: 'LinkedIn' },
  { href: siteConfig.social.twitter, icon: Twitter, label: 'Twitter/X' },
]

export default function ContactPage() {
  return (
    <div className="py-24 lg:py-32">
      <div className="max-w-4xl mx-auto px-6">
        <SectionHeading
          title="Get In Touch"
          subtitle="Have a project in mind? I'd love to hear about it."
        />

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 lg:gap-16">
          {/* Form */}
          <ScrollReveal className="lg:col-span-3">
            <ContactForm />
          </ScrollReveal>

          {/* Alternative Contact */}
          <ScrollReveal delay={0.2} className="lg:col-span-2">
            <div className="bg-slate-50 dark:bg-slate-800/30 rounded-card p-6 lg:p-8 border border-slate-200 dark:border-slate-700/50">
              <h3 className="font-display font-bold text-lg text-slate-900 dark:text-white mb-4">
                Or reach me directly
              </h3>

              <a
                href={`mailto:${siteConfig.email}`}
                className="flex items-center gap-3 p-3 rounded-btn hover:bg-white dark:hover:bg-slate-800 transition-colors group"
              >
                <div className="w-10 h-10 flex items-center justify-center rounded-btn bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                  <Mail size={18} />
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-body">Email</p>
                  <p className="text-sm font-body font-medium text-slate-900 dark:text-white">
                    {siteConfig.email}
                  </p>
                </div>
              </a>

              <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700/50">
                <p className="text-sm font-body text-slate-500 dark:text-slate-400 mb-4">
                  Find me on social media
                </p>
                <div className="flex items-center gap-3">
                  {socialLinks.map((social) => (
                    <a
                      key={social.label}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 flex items-center justify-center rounded-btn bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:text-primary hover:border-primary dark:hover:border-primary transition-all"
                      aria-label={social.label}
                    >
                      <social.icon size={18} />
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </div>
  )
}
