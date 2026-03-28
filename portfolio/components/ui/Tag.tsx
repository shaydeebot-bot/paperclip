interface TagProps {
  children: React.ReactNode
  active?: boolean
  onClick?: () => void
}

export default function Tag({ children, active, onClick }: TagProps) {
  const base =
    'inline-flex items-center px-3 py-1 rounded-pill text-xs font-medium font-body tracking-wide transition-all duration-200'

  if (onClick) {
    return (
      <button
        onClick={onClick}
        className={`${base} cursor-pointer ${
          active
            ? 'bg-primary text-white shadow-md shadow-primary/25'
            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-primary/10 hover:text-primary'
        }`}
      >
        {children}
      </button>
    )
  }

  return (
    <span
      className={`${base} bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400`}
    >
      {children}
    </span>
  )
}
