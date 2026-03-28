import Link from 'next/link'
import Button from '@/components/ui/Button'

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <div className="max-w-md mx-auto px-6 text-center">
        <p className="font-mono text-sm text-primary mb-4">404</p>
        <h1 className="font-display font-bold text-4xl sm:text-5xl text-slate-900 dark:text-white tracking-tight mb-4">
          Page not found<span className="text-primary">.</span>
        </h1>
        <p className="text-slate-500 dark:text-slate-400 font-body mb-10">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <Button href="/">Back to Home</Button>
      </div>
    </div>
  )
}
