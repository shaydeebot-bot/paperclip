import { ReactNode } from 'react'

interface CalloutProps {
  type?: 'info' | 'warning' | 'tip'
  children: ReactNode
}

function Callout({ type = 'info', children }: CalloutProps) {
  const styles = {
    info: 'border-primary/40 bg-primary/5 text-primary',
    warning: 'border-amber-400/40 bg-amber-400/5 text-amber-600 dark:text-amber-400',
    tip: 'border-emerald-400/40 bg-emerald-400/5 text-emerald-600 dark:text-emerald-400',
  }

  const labels = { info: 'Info', warning: 'Warning', tip: 'Tip' }

  return (
    <div className={`border-l-4 rounded-r-btn p-4 my-6 ${styles[type]}`}>
      <p className="font-display font-bold text-sm mb-1">{labels[type]}</p>
      <div className="text-sm text-slate-700 dark:text-slate-300">{children}</div>
    </div>
  )
}

export const mdxComponents = {
  Callout,
  h1: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h1 className="font-display font-bold text-3xl text-slate-900 dark:text-white mt-10 mb-4" {...props} />
  ),
  h2: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h2 className="font-display font-bold text-2xl text-slate-900 dark:text-white mt-10 mb-4" {...props} />
  ),
  h3: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h3 className="font-display font-bold text-xl text-slate-900 dark:text-white mt-8 mb-3" {...props} />
  ),
  p: (props: React.HTMLAttributes<HTMLParagraphElement>) => (
    <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-6 font-body" {...props} />
  ),
  a: (props: React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
    <a className="text-primary underline underline-offset-4 decoration-primary/40 hover:decoration-primary transition-colors" {...props} />
  ),
  ul: (props: React.HTMLAttributes<HTMLUListElement>) => (
    <ul className="list-disc pl-6 mb-6 space-y-2 text-slate-700 dark:text-slate-300 font-body" {...props} />
  ),
  ol: (props: React.HTMLAttributes<HTMLOListElement>) => (
    <ol className="list-decimal pl-6 mb-6 space-y-2 text-slate-700 dark:text-slate-300 font-body" {...props} />
  ),
  blockquote: (props: React.HTMLAttributes<HTMLQuoteElement>) => (
    <blockquote className="border-l-4 border-primary/40 pl-6 italic text-slate-600 dark:text-slate-400 my-6" {...props} />
  ),
  code: (props: React.HTMLAttributes<HTMLElement>) => (
    <code className="font-mono text-sm bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded" {...props} />
  ),
  pre: (props: React.HTMLAttributes<HTMLPreElement>) => (
    <pre className="bg-slate-900 dark:bg-slate-950 rounded-card p-6 overflow-x-auto mb-6 text-sm" {...props} />
  ),
}
