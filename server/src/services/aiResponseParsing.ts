import type { AnswerQuality, InterviewScorecard } from '../types/interview.js'
import type { GeminiSchema } from './geminiService.js'

const answerQualities: AnswerQuality[] = ['UNKNOWN', 'WEAK', 'MODERATE', 'STRONG']

export const interviewTurnSchema: GeminiSchema = {
  type: 'OBJECT',
  properties: {
    answerQuality: { type: 'STRING', enum: ['WEAK', 'MODERATE', 'STRONG'] },
    message: { type: 'STRING' },
  },
  required: ['answerQuality', 'message'],
}

export const scorecardSchema: GeminiSchema = {
  type: 'OBJECT',
  properties: {
    overallScore: { type: 'NUMBER' },
    technicalScore: { type: 'NUMBER' },
    communicationScore: { type: 'NUMBER' },
    problemSolvingScore: { type: 'NUMBER' },
    depthScore: { type: 'NUMBER' },
    strengths: { type: 'ARRAY', items: { type: 'STRING' } },
    weaknesses: { type: 'ARRAY', items: { type: 'STRING' } },
    improvements: { type: 'ARRAY', items: { type: 'STRING' } },
    recommendedTopics: { type: 'ARRAY', items: { type: 'STRING' } },
    finalFeedback: { type: 'STRING' },
  },
  required: [
    'overallScore',
    'technicalScore',
    'communicationScore',
    'problemSolvingScore',
    'depthScore',
    'strengths',
    'weaknesses',
    'improvements',
    'recommendedTopics',
    'finalFeedback',
  ],
}

/** Parses model JSON, tolerating code fences or prose around the object. */
export function parseJsonObject(result: string): Record<string, unknown> | null {
  const normalized = result.trim()
  const candidates = [
    normalized,
    normalized.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim(),
  ]

  const firstBraceIndex = normalized.indexOf('{')
  const lastBraceIndex = normalized.lastIndexOf('}')
  if (firstBraceIndex >= 0 && lastBraceIndex > firstBraceIndex) {
    candidates.push(normalized.slice(firstBraceIndex, lastBraceIndex + 1))
  }

  for (const candidate of candidates) {
    try {
      const parsed: unknown = JSON.parse(candidate)
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
        return parsed as Record<string, unknown>
      }
    } catch {
      continue
    }
  }

  return null
}

function toScore(value: unknown) {
  const score = typeof value === 'string' ? Number(value) : value
  if (typeof score !== 'number' || !Number.isFinite(score)) return null
  return Math.round(Math.min(10, Math.max(0, score)) * 10) / 10
}

function toStringList(value: unknown) {
  if (!Array.isArray(value)) return null
  return value.filter((item): item is string => typeof item === 'string' && item.trim().length > 0).map((item) => item.trim())
}

/** Returns null when the model output is missing required scorecard fields. */
export function parseScorecard(result: string): InterviewScorecard | null {
  const parsed = parseJsonObject(result)
  if (!parsed) return null

  const overallScore = toScore(parsed.overallScore)
  const technicalScore = toScore(parsed.technicalScore)
  const communicationScore = toScore(parsed.communicationScore)
  const problemSolvingScore = toScore(parsed.problemSolvingScore)
  const depthScore = toScore(parsed.depthScore)
  const strengths = toStringList(parsed.strengths)
  const weaknesses = toStringList(parsed.weaknesses)
  const improvements = toStringList(parsed.improvements)
  const recommendedTopics = toStringList(parsed.recommendedTopics)
  const finalFeedback = typeof parsed.finalFeedback === 'string' ? parsed.finalFeedback.trim() : ''

  if (
    overallScore === null ||
    technicalScore === null ||
    communicationScore === null ||
    problemSolvingScore === null ||
    depthScore === null ||
    !strengths ||
    !weaknesses ||
    !improvements ||
    !recommendedTopics ||
    !finalFeedback
  ) {
    return null
  }

  return {
    overallScore,
    technicalScore,
    communicationScore,
    problemSolvingScore,
    depthScore,
    strengths,
    weaknesses,
    improvements,
    recommendedTopics,
    finalFeedback,
  }
}

/** Falls back to treating the whole reply as the interviewer message if the JSON is unusable. */
export function parseInterviewTurn(result: string): { message: string; answerQuality: AnswerQuality } {
  const parsed = parseJsonObject(result)
  const message = typeof parsed?.message === 'string' ? parsed.message.trim() : ''

  if (!parsed || !message) {
    return { message: result.trim(), answerQuality: 'UNKNOWN' }
  }

  const answerQuality = answerQualities.includes(parsed.answerQuality as AnswerQuality)
    ? (parsed.answerQuality as AnswerQuality)
    : 'UNKNOWN'

  return { message, answerQuality }
}
