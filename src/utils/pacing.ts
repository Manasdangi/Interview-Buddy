import type { InterviewMessage } from '../types/interview'

/** Soft target per interviewer question; going over is flagged, never enforced. */
export const questionTargetSeconds = 5 * 60

/** Whole-interview limit used by the countdown. */
export const interviewLimitSeconds = 45 * 60

export type AnswerTiming = {
  /** 1-based position of the answer in the interview. */
  number: number
  seconds: number
}

export function formatSeconds(totalSeconds: number) {
  const safe = Math.max(0, Math.round(totalSeconds))
  const hours = Math.floor(safe / 3600)
  const mins = Math.floor((safe % 3600) / 60)
  const secs = safe % 60
  const mm = String(mins).padStart(2, '0')
  const ss = String(secs).padStart(2, '0')
  return hours > 0 ? `${String(hours).padStart(2, '0')}:${mm}:${ss}` : `${mm}:${ss}`
}

/** How long the candidate took on each question: from the interviewer's message to the candidate's reply. */
export function getAnswerTimings(messages: InterviewMessage[]): AnswerTiming[] {
  const timings: AnswerTiming[] = []
  let questionAskedAt: number | null = null

  for (const message of messages) {
    const at = Date.parse(message.createdAt)
    if (Number.isNaN(at)) continue

    if (message.role === 'AI') {
      questionAskedAt = at
    } else if (questionAskedAt !== null) {
      timings.push({ number: timings.length + 1, seconds: Math.max(0, Math.round((at - questionAskedAt) / 1000)) })
      questionAskedAt = null
    }
  }

  return timings
}

/** Elapsed seconds since the interviewer's latest unanswered question, or null when nothing is pending. */
export function getPendingQuestionStart(messages: InterviewMessage[]): string | null {
  const last = messages.at(-1)
  return last?.role === 'AI' ? last.createdAt : null
}
