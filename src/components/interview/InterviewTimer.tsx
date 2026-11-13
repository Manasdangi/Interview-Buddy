import { useEffect, useEffectEvent, useRef, useState } from 'react'
import type { InterviewMessage } from '../../types/interview'
import { cn } from '../../utils/cn'
import { formatSeconds, getPendingQuestionStart, interviewLimitSeconds, questionTargetSeconds } from '../../utils/pacing'

type InterviewTimerProps = {
  startedAt: string
  completedAt?: string
  messages?: InterviewMessage[]
  maxDurationSeconds?: number
  questionTargetSeconds?: number
  /** Called once when the overall limit is reached while the interview is still running. */
  onTimeUp?: () => void
}

// Ascending, so the tightest threshold that applies wins.
const warningMinutes = [1, 5, 10]

function secondsBetween(fromIso: string, toMs: number) {
  const from = Date.parse(fromIso)
  return Number.isNaN(from) ? 0 : Math.max(0, Math.floor((toMs - from) / 1000))
}

export function InterviewTimer({
  startedAt,
  completedAt,
  messages = [],
  maxDurationSeconds = interviewLimitSeconds,
  questionTargetSeconds: questionTarget = questionTargetSeconds,
  onTimeUp,
}: InterviewTimerProps) {
  const [now, setNow] = useState(() => Date.now())
  const timeUpFiredRef = useRef(false)
  const finished = Boolean(completedAt)

  const elapsedSeconds = secondsBetween(startedAt, completedAt ? Date.parse(completedAt) : now)
  const remainingSeconds = Math.max(0, maxDurationSeconds - elapsedSeconds)
  const timeUp = remainingSeconds === 0
  const pendingQuestionStart = finished ? null : getPendingQuestionStart(messages)
  const questionSeconds = pendingQuestionStart ? secondsBetween(pendingQuestionStart, now) : 0
  const overQuestionTarget = questionSeconds > questionTarget
  const remainingMinutes = Math.ceil(remainingSeconds / 60)
  const warning = !finished && !timeUp && warningMinutes.find((minutes) => remainingSeconds <= minutes * 60)

  const fireTimeUp = useEffectEvent(() => onTimeUp?.())

  useEffect(() => {
    if (finished || timeUp) return undefined

    const interval = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(interval)
  }, [finished, timeUp])

  useEffect(() => {
    if (finished || !timeUp || timeUpFiredRef.current) return
    timeUpFiredRef.current = true
    fireTimeUp()
  }, [finished, timeUp])

  const tone = finished ? 'text-slate-300' : timeUp || remainingSeconds <= 60 ? 'text-rose-300' : remainingSeconds <= 5 * 60 ? 'text-amber-300' : 'text-white'
  const questionProgress = Math.min(100, (questionSeconds / questionTarget) * 100)

  return (
    <div className="space-y-4 rounded-3xl border border-slate-800/80 bg-slate-950/90 p-4 text-sm text-slate-300 shadow-soft">
      <div>
        <p className="text-slate-400">{finished ? 'Time taken' : 'Time left'}</p>
        <p className={cn('mt-2 text-3xl font-semibold tabular-nums', tone)} aria-label={finished ? undefined : `${remainingMinutes} minutes left`}>
          {formatSeconds(finished ? elapsedSeconds : remainingSeconds)}
        </p>
        <p className="mt-1 text-xs text-slate-500">of {Math.round(maxDurationSeconds / 60)} minutes</p>
      </div>

      {pendingQuestionStart ? (
        <div>
          <div className="flex items-baseline justify-between">
            <p className="text-slate-400">This question</p>
            <p className={cn('tabular-nums', overQuestionTarget ? 'text-amber-300' : 'text-slate-200')}>
              {formatSeconds(questionSeconds)} / {formatSeconds(questionTarget)}
            </p>
          </div>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-800">
            <div className={cn('h-full rounded-full transition-[width] duration-1000', overQuestionTarget ? 'bg-amber-400' : 'bg-primary')} style={{ width: `${questionProgress}%` }} />
          </div>
          {overQuestionTarget ? <p className="mt-2 text-xs text-amber-300">Over the target. Wrap up your point and move on, as you would in a real round.</p> : null}
        </div>
      ) : null}

      <div aria-live="polite" className="min-h-4 text-xs">
        {finished ? <span className="text-slate-500">Completed</span> : null}
        {timeUp && !finished ? <span className="text-rose-300">Time is up. Wrapping up your interview...</span> : null}
        {warning ? <span className="text-amber-300">{warning === 1 ? 'Less than a minute left.' : `Less than ${warning} minutes left.`}</span> : null}
      </div>
    </div>
  )
}
