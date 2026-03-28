import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, ArrowRight, Calendar, Clock } from 'lucide-react'
import { MDXRemote } from 'next-mdx-remote/rsc'
import { getAllPosts, getPostBySlug, getAdjacentPosts } from '@/lib/mdx'
import { mdxComponents } from '@/components/blog/MDXComponents'
import Tag from '@/components/ui/Tag'
import { siteConfig } from '@/lib/config'

interface Props {
  params: { slug: string }
}

export function generateStaticParams() {
  const posts = getAllPosts()
  return posts.map((post) => ({ slug: post.slug }))
}

export function generateMetadata({ params }: Props): Metadata {
  const post = getPostBySlug(params.slug)
  if (!post) return {}

  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: 'article',
      publishedTime: post.date,
      url: `${siteConfig.siteUrl}/blog/${post.slug}`,
    },
  }
}

export default function BlogPostPage({ params }: Props) {
  const post = getPostBySlug(params.slug)
  if (!post) notFound()

  const { prev, next } = getAdjacentPosts(params.slug)

  return (
    <div className="py-24 lg:py-32">
      <article className="max-w-3xl mx-auto px-6">
        {/* Back link */}
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 text-sm font-body text-slate-500 dark:text-slate-400 hover:text-primary transition-colors mb-10"
        >
          <ArrowLeft size={14} />
          Back to Blog
        </Link>

        {/* Header */}
        <header className="mb-12">
          <div className="flex items-center gap-4 text-xs font-mono text-slate-400 dark:text-slate-500 mb-4">
            <span className="flex items-center gap-1.5">
              <Calendar size={12} />
              {new Date(post.date).toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock size={12} />
              {post.readingTime} min read
            </span>
          </div>

          <h1 className="font-display font-extrabold text-3xl sm:text-4xl lg:text-5xl text-slate-900 dark:text-white tracking-tight leading-tight mb-6">
            {post.title}
          </h1>

          <div className="flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <Tag key={tag}>{tag}</Tag>
            ))}
          </div>
        </header>

        {/* Content */}
        <div className="prose-custom">
          <MDXRemote source={post.content} components={mdxComponents} />
        </div>

        {/* Navigation */}
        <nav className="mt-16 pt-8 border-t border-slate-200 dark:border-slate-700 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {prev ? (
            <Link
              href={`/blog/${prev.slug}`}
              className="group flex items-center gap-3 p-4 rounded-card border border-slate-200 dark:border-slate-700/50 hover:border-primary dark:hover:border-primary transition-colors"
            >
              <ArrowLeft
                size={16}
                className="text-slate-400 group-hover:text-primary transition-colors"
              />
              <div>
                <p className="text-xs text-slate-400 font-body">Previous</p>
                <p className="text-sm font-display font-semibold text-slate-900 dark:text-white">
                  {prev.title}
                </p>
              </div>
            </Link>
          ) : (
            <div />
          )}
          {next && (
            <Link
              href={`/blog/${next.slug}`}
              className="group flex items-center justify-end gap-3 p-4 rounded-card border border-slate-200 dark:border-slate-700/50 hover:border-primary dark:hover:border-primary transition-colors text-right"
            >
              <div>
                <p className="text-xs text-slate-400 font-body">Next</p>
                <p className="text-sm font-display font-semibold text-slate-900 dark:text-white">
                  {next.title}
                </p>
              </div>
              <ArrowRight
                size={16}
                className="text-slate-400 group-hover:text-primary transition-colors"
              />
            </Link>
          )}
        </nav>

        {/* JSON-LD */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'BlogPosting',
              headline: post.title,
              description: post.excerpt,
              datePublished: post.date,
              author: {
                '@type': 'Person',
                name: siteConfig.name,
              },
              url: `${siteConfig.siteUrl}/blog/${post.slug}`,
            }),
          }}
        />
      </article>
    </div>
  )
}
