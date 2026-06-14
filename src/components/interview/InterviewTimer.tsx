import { useEffect, useState } from 'react'

type InterviewTimerProps = {
  startedAt: string
}

export function InterviewTimer({ startedAt }: InterviewTimerProps) {
  const [elapsed, setElapsed] = useState('00:00')

  useEffect(() => {
    const updateTime = () => {
      const seconds = Math.max(0, Math.floor((Date.now() - new Date(startedAt).getTime()) / 1000))
      const mins = String(Math.floor(seconds / 60)).padStart(2, '0')
      const secs = String(seconds % 60).padStart(2, '0')
      setElapsed(`${mins}:${secs}`)
    }

    updateTime()
    const interval = window.setInterval(updateTime, 1000)
    return () => window.clearInterval(interval)
  }, [startedAt])

  return (
    <div className="rounded-3xl border border-slate-800/80 bg-slate-950/90 p-4 text-sm text-slate-300 shadow-soft">
      <p className="text-slate-400">Interview timer</p>
      <p className="mt-2 text-3xl font-semibold text-white">{elapsed}</p>
    </div>
  )
}
