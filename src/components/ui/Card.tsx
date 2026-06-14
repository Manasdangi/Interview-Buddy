import { cn } from '../../utils/cn'
import type { HTMLAttributes } from 'react'

type CardProps = HTMLAttributes<HTMLDivElement>

export function Card({ className, ...props }: CardProps) {
  return <div className={cn('rounded-3xl border border-slate-800/80 bg-slate-950/90 p-6 shadow-soft', className)} {...props} />
}
