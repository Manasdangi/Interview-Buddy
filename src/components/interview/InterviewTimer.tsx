import { useEffect, useState } from 'react'
import { Timer } from 'lucide-react'
import { cn } from '../../utils/cn'

type InterviewTimerProps = {
  startedAt: string
  completedAt?: string
  maxDurationSeconds?: number
}

const defaultMaxDurationSeconds = 60 * 60

function formatDuration(totalSeconds: number) {
  const hours = Math.floor(totalSeconds / 3600)
  const mins = Math.floor((totalSeconds % 3600) / 60)
  const secs = totalSeconds % 60

  if (hours > 0) {
    return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
  }

  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
}

function getElapsedSeconds(startedAt: string, completedAt?: string, maxDurationSeconds = defaultMaxDurationSeconds) {
  const endTime = completedAt ? new Date(completedAt).getTime() : Date.now()
  const elapsedSeconds = Math.max(0, Math.floor((endTime - new Date(startedAt).getTime()) / 1000))
  return Math.min(elapsedSeconds, maxDurationSeconds)
}

export function InterviewTimer({ startedAt, completedAt, maxDurationSeconds = defaultMaxDurationSeconds }: InterviewTimerProps) {
  const [elapsedSeconds, setElapsedSeconds] = useState(() => getElapsedSeconds(startedAt, completedAt, maxDurationSeconds))
  const hasReachedLimit = elapsedSeconds >= maxDurationSeconds

  useEffect(() => {
    const updateTime = () => {
      setElapsedSeconds(getElapsedSeconds(startedAt, completedAt, maxDurationSeconds))
    }

    updateTime()
    if (completedAt || hasReachedLimit) return undefined

    const interval = window.setInterval(updateTime, 1000)
    return () => window.clearInterval(interval)
  }, [completedAt, hasReachedLimit, maxDurationSeconds, startedAt])

  return (
    <span
      role="timer"
      aria-label={`Elapsed time ${formatDuration(elapsedSeconds)}${hasReachedLimit ? ', time limit reached' : ''}`}
      title={hasReachedLimit ? 'Time limit reached' : 'Elapsed time'}
      className={cn('inline-flex items-center gap-1.5 text-sm font-semibold tabular-nums text-slate-200', hasReachedLimit && 'text-amber-300')}
    >
      <Timer className="h-4 w-4 text-slate-400" aria-hidden="true" />
      {formatDuration(elapsedSeconds)}
    </span>
  )
}
