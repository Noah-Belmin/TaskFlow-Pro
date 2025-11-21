import * as React from 'react'
import { cn } from '@/lib/utils'

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary' | 'outline'
}

function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  const variants = {
    default: 'bg-blue-600 text-white dark:bg-blue-500',
    secondary: 'bg-slate-200 text-slate-900 dark:bg-slate-700 dark:text-slate-100',
    outline: 'border border-slate-300 text-slate-900 dark:border-slate-600 dark:text-slate-100',
  }

  return (
    <div
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors',
        variants[variant],
        className
      )}
      {...props}
    />
  )
}

export { Badge }
