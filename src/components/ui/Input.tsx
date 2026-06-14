import type { InputHTMLAttributes } from 'react'
import { cn } from '../../utils/cn'

type InputProps = InputHTMLAttributes<HTMLInputElement>

export function Input({ className, ...props }: InputProps) {
  return (
    <input
      className={cn(
        'w-full rounded-2xl border border-slate-700 bg-slate-950/90 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30',
        className,
      )}
      {...props}
    />
  )
}
