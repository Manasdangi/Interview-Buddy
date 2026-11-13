import { useMemo } from 'react'
import type { InterviewMessage, InterviewScorecard, QuestionReview, RubricScores } from '../../types/interview'
import { formatSeconds, getAnswerTimings, questionTargetSeconds } from '../../utils/pacing'
import { cn } from '../../utils/cn'
import { Card } from '../ui/Card'

type ScoreCardProps = {
  scorecard: InterviewScorecard
  messages?: InterviewMessage[]
  startedAt?: string
  completedAt?: string
}

const rubricLabels: Array<{ key: keyof RubricScores; label: string; hint: string }> = [
  { key: 'correctness', label: 'Correctness', hint: 'Was it technically right?' },
  { key: 'depth', label: 'Depth', hint: 'Did you explain the why?' },
  { key: 'communication', label: 'Communication', hint: 'Clear, structured, concise?' },
  { key: 'edgeCases', label: 'Edge cases', hint: 'Failures, empty/slow/large inputs, a11y' },
  { key: 'tradeOffs', label: 'Trade-offs', hint: 'Alternatives weighed and justified?' },
]

function scoreTone(score: number) {
  if (score >= 7.5) return { bar: 'bg-emerald-400', text: 'text-emerald-300' }
  if (score >= 5) return { bar: 'bg-amber-400', text: 'text-amber-300' }
  return { bar: 'bg-rose-400', text: 'text-rose-300' }
}

function ScoreBar({ label, hint, score }: { label: string; hint: string; score: number }) {
  const tone = scoreTone(score)

  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <p className="text-sm font-medium text-slate-200" title={hint}>{label}</p>
        <p className={cn('text-sm font-semibold', tone.text)}>{score}/10</p>
      </div>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-800" role="img" aria-label={`${label}: ${score} out of 10`}>
        <div className={cn('h-full rounded-full', tone.bar)} style={{ width: `${Math.min(100, Math.max(0, score * 10))}%` }} />
      </div>
      <p className="mt-1 text-xs text-slate-500">{hint}</p>
    </div>
  )
}

function ReviewItem({ review, index, seconds, yourAnswer }: { review: QuestionReview; index: number; seconds?: number; yourAnswer?: string }) {
  const tone = scoreTone(review.score)

  return (
    <details className="group rounded-3xl border border-slate-800/80 bg-slate-900/70 p-4 open:bg-slate-900">
      <summary className="flex cursor-pointer list-none items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
            Question {index + 1}
            {review.topic ? ` • ${review.topic}` : ''}
            {seconds !== undefined ? ` • ${formatSeconds(seconds)}` : ''}
          </p>
          <p className="mt-1 font-medium text-white">{review.question}</p>
        </div>
        <span className={cn('shrink-0 rounded-full bg-slate-950 px-3 py-1 text-sm font-semibold', tone.text)}>{review.score}/10</span>
      </summary>

      <div className="mt-4 space-y-4 text-sm leading-6 text-slate-300">
        {yourAnswer ? (
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Your answer</p>
            <p className="mt-1 max-h-48 overflow-auto whitespace-pre-wrap rounded-2xl bg-slate-950 p-3 text-slate-300">{yourAnswer}</p>
          </div>
        ) : review.answerSummary ? (
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">What you said</p>
            <p className="mt-1">{review.answerSummary}</p>
          </div>
        ) : null}
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Feedback</p>
          <p className="mt-1">{review.feedback}</p>
        </div>
        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-3">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-300">Ideal answer</p>
          <p className="mt-1 whitespace-pre-wrap text-slate-200">{review.idealAnswer}</p>
        </div>
      </div>
    </details>
  )
}

export function ScoreCard({ scorecard, messages = [], startedAt, completedAt }: ScoreCardProps) {
  const timings = useMemo(() => getAnswerTimings(messages), [messages])
  const userAnswers = useMemo(() => messages.filter((message) => message.role === 'USER').map((message) => message.content), [messages])
  const reviews = scorecard.questionReviews ?? []
  // Reviews are one per answered question, so the candidate's own text can be lined up with them.
  const reviewsMatchAnswers = reviews.length > 0 && reviews.length === userAnswers.length
  const totalSeconds = startedAt && completedAt ? Math.max(0, Math.round((Date.parse(completedAt) - Date.parse(startedAt)) / 1000)) : null
  const overallTone = scoreTone(scorecard.overallScore)
  const topFixes = scorecard.improvements.slice(0, 3)

  return (
    <Card className="space-y-8 border-slate-800/80">
      <div className="flex flex-wrap items-center justify-between gap-6">
        <div>
          <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Interview report</p>
          <h2 className="mt-2 text-3xl font-semibold text-white">How you did</h2>
          {totalSeconds !== null ? <p className="mt-2 text-sm text-slate-400">Total time {formatSeconds(totalSeconds)}</p> : null}
        </div>
        <div className="rounded-3xl border border-slate-800/80 bg-slate-900 px-8 py-5 text-center">
          <p className="text-sm text-slate-400">Overall</p>
          <p className={cn('mt-1 text-5xl font-semibold', overallTone.text)}>{scorecard.overallScore}<span className="text-2xl text-slate-500">/10</span></p>
        </div>
      </div>

      {scorecard.rubric ? (
        <section aria-label="Rubric scores" className="grid gap-5 sm:grid-cols-2">
          {rubricLabels.map((item) => (
            <ScoreBar key={item.key} label={item.label} hint={item.hint} score={scorecard.rubric![item.key]} />
          ))}
        </section>
      ) : (
        <section aria-label="Scores" className="grid gap-4 sm:grid-cols-2">
          {[
            { label: 'Technical', value: scorecard.technicalScore },
            { label: 'Communication', value: scorecard.communicationScore },
            { label: 'Problem solving', value: scorecard.problemSolvingScore },
            { label: 'Depth', value: scorecard.depthScore },
          ].map((item) => (
            <div key={item.label} className="rounded-3xl border border-slate-800/80 bg-slate-900 p-4">
              <p className="text-sm text-slate-400">{item.label}</p>
              <p className="mt-2 text-3xl font-semibold text-white">{item.value}/10</p>
            </div>
          ))}
        </section>
      )}

      {topFixes.length ? (
        <section className="rounded-3xl border border-indigo-500/30 bg-indigo-500/5 p-5">
          <h3 className="text-lg font-semibold text-white">Fix these {topFixes.length} things before your next interview</h3>
          <ol className="mt-3 space-y-3 text-slate-200">
            {topFixes.map((item, index) => (
              <li key={item} className="flex gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-white">{index + 1}</span>
                <span className="leading-6">{item}</span>
              </li>
            ))}
          </ol>
        </section>
      ) : null}

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <p className="text-sm text-slate-400">Strengths</p>
          <ul className="mt-3 space-y-2 text-slate-200">
            {scorecard.strengths.map((item) => (
              <li key={item}>• {item}</li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-sm text-slate-400">Weaknesses</p>
          <ul className="mt-3 space-y-2 text-slate-200">
            {scorecard.weaknesses.map((item) => (
              <li key={item}>• {item}</li>
            ))}
          </ul>
        </div>
      </div>

      {reviews.length ? (
        <section className="space-y-3">
          <div>
            <h3 className="text-lg font-semibold text-white">Question by question</h3>
            <p className="text-sm text-slate-400">Open a question to compare your answer with an ideal one.</p>
          </div>
          {reviews.map((review, index) => (
            <ReviewItem
              key={`${index}-${review.question}`}
              review={review}
              index={index}
              seconds={reviewsMatchAnswers ? timings[index]?.seconds : undefined}
              yourAnswer={reviewsMatchAnswers ? userAnswers[index] : undefined}
            />
          ))}
        </section>
      ) : null}

      {timings.length ? (
        <section>
          <h3 className="text-lg font-semibold text-white">Pacing</h3>
          <p className="text-sm text-slate-400">Time from the question to your answer. Aim for about {formatSeconds(questionTargetSeconds)} or less.</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {timings.map((timing) => (
              <span
                key={timing.number}
                className={cn(
                  'rounded-full border px-3 py-1 text-sm',
                  timing.seconds > questionTargetSeconds ? 'border-amber-500/40 text-amber-300' : 'border-slate-700 text-slate-300',
                )}
              >
                Q{timing.number} {formatSeconds(timing.seconds)}
              </span>
            ))}
          </div>
        </section>
      ) : null}

      <div>
        <h3 className="text-lg font-semibold text-white">Final feedback</h3>
        <p className="mt-2 text-slate-300">{scorecard.finalFeedback}</p>
      </div>
    </Card>
  )
}
