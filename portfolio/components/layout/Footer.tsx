import Link from 'next/link'
import { Github, Linkedin, Twitter } from 'lucide-react'
import { siteConfig } from '@/lib/config'

const socialLinks = [
  { href: siteConfig.social.github, icon: Github, label: 'GitHub' },
  { href: siteConfig.social.linkedin, icon: Linkedin, label: 'LinkedIn' },
  { href: siteConfig.social.twitter, icon: Twitter, label: 'Twitter' },
]

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 dark:border-slate-800">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Brand */}
          <div className="flex items-center gap-6">
            <Link
              href="/"
              className="font-display font-bold text-lg text-slate-900 dark:text-white"
            >
              {siteConfig.name.split(' ')[0]}
              <span className="text-primary">.</span>
            </Link>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-body">
              {siteConfig.tagline}
            </p>
          </div>

          {/* Social */}
          <div className="flex items-center gap-4">
            {socialLinks.map((social) => (
              <a
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 flex items-center justify-center rounded-btn text-slate-500 dark:text-slate-400 hover:text-primary hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200"
                aria-label={social.label}
              >
                <social.icon size={18} />
              </a>
            ))}
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-slate-200 dark:border-slate-800 text-center">
          <p className="text-xs text-slate-400 dark:text-slate-500 font-body">
            &copy; {new Date().getFullYear()} {siteConfig.name}. All rights
            reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
