import type { ButtonHTMLAttributes } from 'react'
import { cn } from '../../utils/cn'

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost'
}

export function Button({ className, variant = 'primary', ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center rounded-2xl px-5 py-3 text-sm font-semibold transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
        variant === 'primary' && 'bg-primary text-white hover:bg-indigo-500',
        variant === 'secondary' && 'border border-slate-700 bg-slate-900 text-slate-100 hover:bg-slate-800',
        variant === 'ghost' && 'bg-transparent text-slate-300 hover:bg-slate-800',
        className,
      )}
      {...props}
    />
  )
}
