import Hero from '@/components/home/Hero'
import FeaturedProjects from '@/components/home/FeaturedProjects'
import Testimonials from '@/components/home/Testimonials'
import Button from '@/components/ui/Button'
import ScrollReveal from '@/components/ui/ScrollReveal'
import { siteConfig } from '@/lib/config'

export default function Home() {
  return (
    <>
      <Hero />
      <FeaturedProjects />
      <Testimonials />

      {/* CTA Banner */}
      <section className="py-24 lg:py-32 bg-slate-900 dark:bg-slate-950 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-primary/10 blur-[100px]" />
        </div>
        <div className="relative z-10 max-w-3xl mx-auto px-6 text-center">
          <ScrollReveal>
            <h2 className="font-display font-bold text-3xl sm:text-4xl lg:text-5xl text-white tracking-tight mb-6">
              Have a project in mind?
              <br />
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Let&apos;s talk
              </span>
              <span className="text-primary">.</span>
            </h2>
            <p className="text-slate-400 font-body text-lg mb-10">
              I&apos;m always open to discussing new projects, creative ideas, or
              opportunities to be part of your vision.
            </p>
            <Button href="/contact">Start a Conversation</Button>
          </ScrollReveal>
        </div>
      </section>

      {/* JSON-LD Person Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Person',
            name: siteConfig.name,
            url: siteConfig.siteUrl,
            jobTitle: siteConfig.role,
            sameAs: [
              siteConfig.social.github,
              siteConfig.social.linkedin,
              siteConfig.social.twitter,
            ],
          }),
        }}
      />
    </>
  )
}
