import { cn } from '../../utils/cn'
import type { HTMLAttributes } from 'react'

type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  variant?: 'primary' | 'success' | 'warning'
}

export function Badge({ variant = 'primary', className, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em]',
        variant === 'primary' && 'bg-indigo-500/10 text-indigo-300',
        variant === 'success' && 'bg-emerald-500/10 text-emerald-300',
        variant === 'warning' && 'bg-amber-500/10 text-amber-300',
        className,
      )}
      {...props}
    />
  )
}
