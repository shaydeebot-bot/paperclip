import Link from 'next/link'
import { Calendar, Clock } from 'lucide-react'
import Tag from '@/components/ui/Tag'
import { BlogPost } from '@/lib/types'

interface BlogCardProps {
  post: BlogPost
}

export default function BlogCard({ post }: BlogCardProps) {
  return (
    <Link href={`/blog/${post.slug}`} className="group block">
      <article className="bg-white dark:bg-slate-800/50 rounded-card border border-slate-200 dark:border-slate-700/50 p-6 hover:shadow-xl hover:shadow-slate-200/50 dark:hover:shadow-slate-900/50 transition-all duration-500 hover:-translate-y-1 h-full">
        <div className="flex items-center gap-4 text-xs font-mono text-slate-400 dark:text-slate-500 mb-4">
          <span className="flex items-center gap-1.5">
            <Calendar size={12} />
            {new Date(post.date).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}
          </span>
          <span className="flex items-center gap-1.5">
            <Clock size={12} />
            {post.readingTime} min read
          </span>
        </div>

        <h3 className="font-display font-bold text-xl text-slate-900 dark:text-white mb-3 group-hover:text-primary transition-colors">
          {post.title}
        </h3>

        <p className="text-sm font-body text-slate-600 dark:text-slate-400 leading-relaxed mb-4 line-clamp-3">
          {post.excerpt}
        </p>

        <div className="flex flex-wrap gap-2">
          {post.tags.map((tag) => (
            <Tag key={tag}>{tag}</Tag>
          ))}
        </div>
      </article>
    </Link>
  )
}
