import { describe, expect, it } from 'vitest'
import type { InterviewMessage } from '../types/interview'
import { formatSeconds, getAnswerTimings, getPendingQuestionStart } from './pacing'

function message(role: 'AI' | 'USER', at: string): InterviewMessage {
  return { id: `${role}-${at}`, role, content: 'x', createdAt: at }
}

describe('formatSeconds', () => {
  it('formats minutes and hours', () => {
    expect(formatSeconds(0)).toBe('00:00')
    expect(formatSeconds(65)).toBe('01:05')
    expect(formatSeconds(3725)).toBe('01:02:05')
    expect(formatSeconds(-5)).toBe('00:00')
  })
})

describe('getAnswerTimings', () => {
  it('measures question to answer, ignoring follow-up gaps', () => {
    const timings = getAnswerTimings([
      message('AI', '2026-01-01T10:00:00.000Z'),
      message('USER', '2026-01-01T10:02:30.000Z'),
      message('AI', '2026-01-01T10:02:40.000Z'),
      message('USER', '2026-01-01T10:03:10.000Z'),
    ])
    expect(timings).toEqual([
      { number: 1, seconds: 150 },
      { number: 2, seconds: 30 },
    ])
  })

  it('skips unparseable timestamps and answers with no question', () => {
    expect(getAnswerTimings([message('USER', '2026-01-01T10:00:00.000Z'), message('AI', 'Sending...')])).toEqual([])
  })
})

describe('getPendingQuestionStart', () => {
  it('returns the time of an unanswered question only', () => {
    expect(getPendingQuestionStart([message('AI', 'a'), message('USER', 'b')])).toBeNull()
    expect(getPendingQuestionStart([message('USER', 'b'), message('AI', 'c')])).toBe('c')
    expect(getPendingQuestionStart([])).toBeNull()
  })
})
