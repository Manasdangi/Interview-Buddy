import type { AnswerQuality, FollowUpMove, InterviewScorecard, QuestionReview, RubricScores } from '../types/interview.js'
import type { GeminiSchema } from './geminiService.js'

const answerQualities: AnswerQuality[] = ['UNKNOWN', 'WEAK', 'MODERATE', 'STRONG']
export const followUpMoves: FollowUpMove[] = ['HINT', 'PROBE_WHY', 'EDGE_CASE', 'SCALE', 'CHANGE_REQUIREMENT', 'NEXT_TOPIC']

export const interviewTurnSchema: GeminiSchema = {
  type: 'OBJECT',
  properties: {
    answerQuality: { type: 'STRING', enum: ['WEAK', 'MODERATE', 'STRONG'] },
    gaps: { type: 'ARRAY', items: { type: 'STRING' } },
    nextMove: { type: 'STRING', enum: followUpMoves },
    message: { type: 'STRING' },
  },
  required: ['answerQuality', 'gaps', 'nextMove', 'message'],
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
    rubric: {
      type: 'OBJECT',
      properties: {
        correctness: { type: 'NUMBER' },
        depth: { type: 'NUMBER' },
        communication: { type: 'NUMBER' },
        edgeCases: { type: 'NUMBER' },
        tradeOffs: { type: 'NUMBER' },
      },
      required: ['correctness', 'depth', 'communication', 'edgeCases', 'tradeOffs'],
    },
    questionReviews: {
      type: 'ARRAY',
      items: {
        type: 'OBJECT',
        properties: {
          question: { type: 'STRING' },
          topic: { type: 'STRING' },
          answerSummary: { type: 'STRING' },
          score: { type: 'NUMBER' },
          feedback: { type: 'STRING' },
          idealAnswer: { type: 'STRING' },
        },
        required: ['question', 'answerSummary', 'score', 'feedback', 'idealAnswer'],
      },
    },
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
    'rubric',
    'questionReviews',
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

function toText(value: unknown, limit: number) {
  return typeof value === 'string' ? value.trim().slice(0, limit) : ''
}

function parseRubric(value: unknown): RubricScores | undefined {
  if (!value || typeof value !== 'object') return undefined
  const record = value as Record<string, unknown>
  const correctness = toScore(record.correctness)
  const depth = toScore(record.depth)
  const communication = toScore(record.communication)
  const edgeCases = toScore(record.edgeCases)
  const tradeOffs = toScore(record.tradeOffs)

  if (correctness === null || depth === null || communication === null || edgeCases === null || tradeOffs === null) return undefined
  return { correctness, depth, communication, edgeCases, tradeOffs }
}

function parseQuestionReviews(value: unknown): QuestionReview[] | undefined {
  if (!Array.isArray(value)) return undefined

  const reviews: QuestionReview[] = []
  for (const item of value) {
    if (!item || typeof item !== 'object') continue
    const record = item as Record<string, unknown>
    const score = toScore(record.score)
    const question = toText(record.question, 400)
    const feedback = toText(record.feedback, 600)
    const idealAnswer = toText(record.idealAnswer, 1500)
    if (score === null || !question || !feedback || !idealAnswer) continue

    const topic = toText(record.topic, 120)
    reviews.push({
      question,
      ...(topic ? { topic } : {}),
      answerSummary: toText(record.answerSummary, 600),
      score,
      feedback,
      idealAnswer,
    })
  }

  return reviews.length ? reviews.slice(0, 10) : undefined
}

/**
 * Returns null when the model output is missing the core scorecard fields. The rubric and per-question
 * reviews are optional: when the model returns them malformed they are dropped instead of failing the report.
 */
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

  const rubric = parseRubric(parsed.rubric)
  const questionReviews = parseQuestionReviews(parsed.questionReviews)

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
    ...(rubric ? { rubric } : {}),
    ...(questionReviews ? { questionReviews } : {}),
  }
}

export type ParsedInterviewTurn = {
  message: string
  answerQuality: AnswerQuality
  /** Concepts the candidate missed or got wrong, as named by the model. */
  gaps: string[]
  /** What kind of follow-up the model chose; null when the model did not say. */
  nextMove: FollowUpMove | null
}

/** Falls back to treating the whole reply as the interviewer message if the JSON is unusable. */
export function parseInterviewTurn(result: string): ParsedInterviewTurn {
  const parsed = parseJsonObject(result)
  const message = typeof parsed?.message === 'string' ? parsed.message.trim() : ''

  if (!parsed || !message) {
    return { message: result.trim(), answerQuality: 'UNKNOWN', gaps: [], nextMove: null }
  }

  const answerQuality = answerQualities.includes(parsed.answerQuality as AnswerQuality)
    ? (parsed.answerQuality as AnswerQuality)
    : 'UNKNOWN'
  const nextMove = followUpMoves.includes(parsed.nextMove as FollowUpMove) ? (parsed.nextMove as FollowUpMove) : null
  const gaps = (toStringList(parsed.gaps) ?? []).map((gap) => gap.slice(0, 120)).slice(0, 3)

  return { message, answerQuality, gaps, nextMove }
}
