import * as React from 'react'
import { cn } from '@/lib/utils'
import { ChevronDown } from 'lucide-react'

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div className="relative">
        <select
          className={cn(
            'flex h-10 w-full rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-sm dark:text-slate-100 appearance-none cursor-pointer',
            'focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent',
            'disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-slate-50 dark:disabled:bg-slate-800',
            'hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors',
            'pr-10', // Extra padding for the chevron
            className
          )}
          ref={ref}
          {...props}
        >
          {children}
        </select>
        <ChevronDown
          className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 dark:text-slate-400 pointer-events-none"
          aria-hidden="true"
        />
      </div>
    )
  }
)

Select.displayName = 'Select'

export { Select }
