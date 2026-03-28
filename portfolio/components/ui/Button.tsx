'use client'

import { forwardRef, ButtonHTMLAttributes } from 'react'

type Variant = 'primary' | 'secondary' | 'ghost'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  href?: string
}

const variantStyles: Record<Variant, string> = {
  primary:
    'bg-primary text-white hover:bg-primary-500 shadow-lg shadow-primary/25 hover:shadow-primary/40',
  secondary:
    'border-2 border-slate-300 dark:border-slate-600 text-slate-800 dark:text-slate-200 hover:border-primary hover:text-primary dark:hover:border-primary dark:hover:text-primary',
  ghost:
    'text-slate-600 dark:text-slate-400 hover:text-primary dark:hover:text-primary hover:bg-slate-100 dark:hover:bg-slate-800',
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', className = '', children, href, ...props }, ref) => {
    const base =
      'inline-flex items-center justify-center gap-2 px-6 py-3 rounded-btn font-body font-medium text-sm tracking-wide transition-all duration-300 disabled:opacity-50 disabled:pointer-events-none'

    if (href) {
      return (
        <a
          href={href}
          className={`${base} ${variantStyles[variant]} ${className}`}
        >
          {children}
        </a>
      )
    }

    return (
      <button
        ref={ref}
        className={`${base} ${variantStyles[variant]} ${className}`}
        {...props}
      >
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'

export default Button
