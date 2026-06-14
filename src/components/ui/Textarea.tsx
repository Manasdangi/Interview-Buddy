import type { TextareaHTMLAttributes } from 'react'
import { cn } from '../../utils/cn'

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement>

export function Textarea({ className, ...props }: TextareaProps) {
  return (
    <textarea
      className={cn(
        'min-h-[128px] w-full resize-none rounded-3xl border border-slate-700 bg-slate-950/90 px-4 py-4 text-sm text-slate-100 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30',
        className,
      )}
      {...props}
    />
  )
}
