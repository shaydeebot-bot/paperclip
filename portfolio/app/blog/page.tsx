import { Metadata } from 'next'
import SectionHeading from '@/components/ui/SectionHeading'
import BlogCard from '@/components/blog/BlogCard'
import { getAllPosts } from '@/lib/mdx'
import { siteConfig } from '@/lib/config'

export const metadata: Metadata = {
  title: 'Blog',
  description: `Articles about web development, design, and technology by ${siteConfig.name}.`,
}

export default function BlogPage() {
  const posts = getAllPosts()

  return (
    <div className="py-24 lg:py-32">
      <div className="max-w-6xl mx-auto px-6">
        <SectionHeading
          title="Blog"
          subtitle="Thoughts on web development, design, and technology"
        />

        {posts.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-slate-400 dark:text-slate-500 font-body text-lg">
              No posts yet. Check back soon!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {posts.map((post) => (
              <BlogCard key={post.slug} post={post} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
