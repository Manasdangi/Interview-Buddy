import { useEffect, useState } from 'react'

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
    <div className="rounded-3xl border border-slate-800/80 bg-slate-950/90 p-4 text-sm text-slate-300 shadow-soft">
      <p className="text-slate-400">Interview timer</p>
      <p className="mt-2 text-3xl font-semibold text-white">{formatDuration(elapsedSeconds)}</p>
      {completedAt ? <p className="mt-2 text-xs text-slate-500">Completed</p> : null}
      {!completedAt && hasReachedLimit ? <p className="mt-2 text-xs text-amber-300">Time limit reached</p> : null}
    </div>
  )
}
