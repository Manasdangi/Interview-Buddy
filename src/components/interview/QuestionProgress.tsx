import { cn } from '../../utils/cn'

type QuestionProgressProps = {
  current: number
  total: number
  answered: number
}

export function QuestionProgress({ current, total, answered }: QuestionProgressProps) {
  return (
    <div className="flex items-center gap-2" role="img" aria-label={`Question ${current} of ${total}, ${answered} answered`}>
      <div className="flex gap-1" aria-hidden="true">
        {Array.from({ length: total }, (_, index) => (
          <span
            key={index}
            className={cn(
              'h-1.5 w-5 rounded-full transition-colors sm:w-6',
              index < answered && 'bg-indigo-400',
              index >= answered && index < current && 'animate-pulse bg-primary/70',
              index >= current && 'bg-slate-800',
            )}
          />
        ))}
      </div>
      <span className="text-xs font-semibold tabular-nums text-slate-300">
        Q {current}/{total}
      </span>
    </div>
  )
}
