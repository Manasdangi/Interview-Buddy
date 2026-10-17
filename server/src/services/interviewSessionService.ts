import { createHash, randomBytes, timingSafeEqual } from 'crypto'
import type {
  AnswerQuality,
  Difficulty,
  DifficultyTrend,
  InterviewState,
  InterviewScorecard,
  InterviewSession,
  InterviewType,
  QuestionSet,
  StoredInterviewSession,
} from '../types/interview.js'
import { HttpError } from '../utils/httpError.js'
import { generateJson, generateText, transcribeAudio } from './geminiService.js'
import { buildScorecardPrompt, createInterviewPrompt } from './interviewPromptService.js'
import { interviewTurnSchema, parseInterviewTurn, parseScorecard, scorecardSchema } from './aiResponseParsing.js'
import { createId } from '../utils/id.js'
import {
  createInterviewSession,
  getInterviewSummary,
  getStoredInterviewSession,
  updateInterviewSession,
} from './interviewSessionRepository.js'
import { getDailyQuestionVariant } from './dailyQuestionVariantService.js'

export type SessionAccess = {
  uid: string | null
  sessionKey?: string
}

const interviewTypes: InterviewType[] = ['ROUND_1', 'ROUND_2', 'SYSTEM_DESIGN']
const difficulties: Difficulty[] = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED']
const defaultMaxQuestions = 5
const defaultQuestionSet: QuestionSet = 1
const promptStateHistoryLimit = 4
const scorecardAttempts = 2
const turnLockMs = 90_000
export const maxAnswerLength = 8_000
const sessionNotFoundMessage = 'Session not found. Please start a new interview.'

function normalizeQuestionSet(questionSet?: unknown): QuestionSet {
  return typeof questionSet === 'number' && Number.isInteger(questionSet) && questionSet >= 1 && questionSet <= 5
    ? (questionSet as QuestionSet)
    : defaultQuestionSet
}

function hashAccessKey(accessKey: string) {
  return createHash('sha256').update(accessKey).digest('hex')
}

function matchesAccessKey(session: StoredInterviewSession, accessKey?: string) {
  if (!session.accessKeyHash || !accessKey) return false
  const expected = Buffer.from(session.accessKeyHash, 'hex')
  const actual = Buffer.from(hashAccessKey(accessKey), 'hex')
  return expected.length === actual.length && timingSafeEqual(expected, actual)
}

async function canAccessSession(session: StoredInterviewSession, access: SessionAccess) {
  if (session.uid && access.uid === session.uid) return true
  if (matchesAccessKey(session, access.sessionKey)) return true

  // Sessions created before ownership was recorded: allow the user whose saved history references them.
  if (!session.uid && !session.accessKeyHash && access.uid) {
    return Boolean(await getInterviewSummary(access.uid, session.id))
  }

  return false
}

export function toPublicSession(session: StoredInterviewSession): InterviewSession {
  const publicSession: StoredInterviewSession = { ...session }
  delete publicSession.uid
  delete publicSession.accessKeyHash
  delete publicSession.version
  delete publicSession.pendingTurnAt
  return publicSession
}

function createMessage(role: 'AI' | 'USER', content: string) {
  return {
    id: createId(),
    role,
    content,
    createdAt: new Date().toISOString(),
  }
}

function createInterviewState(): InterviewState {
  return {
    questionNumber: 0,
    askedTopics: [],
    candidateStrengths: [],
    candidateWeakAreas: [],
    difficultyTrend: 'STEADY',
    lastQuestionTopic: null,
    lastAnswerQuality: 'UNKNOWN',
    recentAnswerQualities: [],
  }
}

function ensureInterviewState(session: StoredInterviewSession) {
  session.interviewState = {
    ...createInterviewState(),
    ...session.interviewState,
    askedTopics: session.interviewState?.askedTopics ?? [],
    candidateStrengths: session.interviewState?.candidateStrengths ?? [],
    candidateWeakAreas: session.interviewState?.candidateWeakAreas ?? [],
    recentAnswerQualities: session.interviewState?.recentAnswerQualities ?? [],
  }

  return session
}

function buildSession(interviewType: InterviewType, difficulty: Difficulty, questionSet: QuestionSet) {
  const startedAt = new Date().toISOString()
  const session: StoredInterviewSession = {
    id: createId(),
    interviewType,
    difficulty,
    questionSet,
    dailyQuestionVariant: getDailyQuestionVariant(interviewType, difficulty, questionSet, new Date(startedAt)),
    status: 'ACTIVE',
    messages: [],
    currentQuestionCount: 0,
    maxQuestions: defaultMaxQuestions,
    interviewState: createInterviewState(),
    startedAt,
  }
  return session
}

function getSessionDailyVariant(session: InterviewSession) {
  return session.dailyQuestionVariant ?? getDailyQuestionVariant(
    session.interviewType,
    session.difficulty,
    normalizeQuestionSet(session.questionSet),
    new Date(session.startedAt),
  )
}

function uniquePush(items: string[], value: string, limit = 5) {
  const normalized = value.trim()
  if (!normalized) return items

  const next = items.filter((item) => item !== normalized)
  next.push(normalized)
  return next.slice(-limit)
}

function getTopicForQuestion(session: InterviewSession, questionNumber: number) {
  const dailyVariant = getSessionDailyVariant(session)
  const topicIndex = Math.max(0, Math.min(dailyVariant.topicPath.length - 1, questionNumber - 1))
  return dailyVariant.topicPath[topicIndex] ?? null
}

export function getDifficultyTrend(recentAnswerQualities: AnswerQuality[]): DifficultyTrend {
  const scored: number[] = recentAnswerQualities.map((quality) => {
    if (quality === 'STRONG') return 3
    if (quality === 'MODERATE') return 2
    if (quality === 'WEAK') return 1
    return 0
  }).filter((value) => value > 0)

  if (!scored.length) return 'STEADY'

  const average = scored.reduce((sum, value) => sum + value, 0) / scored.length
  if (average >= 2.5) return 'RISING'
  if (average <= 1.5) return 'EASING'
  return 'STEADY'
}

function updateStateAfterQuestion(session: InterviewSession) {
  const topic = getTopicForQuestion(session, session.currentQuestionCount)

  session.interviewState = {
    ...session.interviewState,
    questionNumber: session.currentQuestionCount,
    lastQuestionTopic: topic,
    askedTopics: topic ? uniquePush(session.interviewState.askedTopics, topic) : session.interviewState.askedTopics,
  }
}

function updateStateAfterAnswer(session: InterviewSession, quality: AnswerQuality) {
  const topic = session.interviewState.lastQuestionTopic
  const recentAnswerQualities = [...session.interviewState.recentAnswerQualities, quality].slice(-promptStateHistoryLimit)

  session.interviewState = {
    ...session.interviewState,
    lastAnswerQuality: quality,
    recentAnswerQualities,
    difficultyTrend: getDifficultyTrend(recentAnswerQualities),
    candidateStrengths:
      quality === 'STRONG' && topic
        ? uniquePush(session.interviewState.candidateStrengths, topic)
        : session.interviewState.candidateStrengths,
    candidateWeakAreas:
      quality === 'WEAK' && topic
        ? uniquePush(session.interviewState.candidateWeakAreas, topic)
        : session.interviewState.candidateWeakAreas,
  }
}

/** Loads a session the caller owns; responds 404 (not 403) so session ids can't be probed. */
export async function getAuthorizedSession(sessionId: string | undefined, access: SessionAccess) {
  if (!sessionId) {
    throw new HttpError(400, 'sessionId is required.')
  }

  const session = await getStoredInterviewSession(sessionId)
  if (!session || !(await canAccessSession(session, access))) {
    throw new HttpError(404, sessionNotFoundMessage)
  }

  return ensureInterviewState(session)
}

/**
 * Runs one AI-backed step on the session while holding a short lock, so overlapping requests
 * (double submits, retries, two tabs) get a 409 instead of silently overwriting each other.
 */
async function runExclusiveTurn<T>(session: StoredInterviewSession, work: (session: StoredInterviewSession) => Promise<T>) {
  const pendingSince = session.pendingTurnAt ? Date.parse(session.pendingTurnAt) : 0
  if (Date.now() - pendingSince < turnLockMs) {
    throw new HttpError(409, 'Your previous request is still being processed. Please wait a moment.')
  }

  session.pendingTurnAt = new Date().toISOString()
  await updateInterviewSession(session, session.version ?? 0)
  const claimed = structuredClone(session)

  try {
    const result = await work(session)
    delete session.pendingTurnAt
    await updateInterviewSession(session, claimed.version ?? 0)
    return result
  } catch (error) {
    delete claimed.pendingTurnAt
    await updateInterviewSession(claimed, claimed.version ?? 0).catch(() => undefined)
    throw error
  }
}

async function generateScorecard(session: InterviewSession): Promise<InterviewScorecard> {
  const prompt = buildScorecardPrompt(
    session.interviewType,
    session.difficulty,
    normalizeQuestionSet(session.questionSet),
    getSessionDailyVariant(session),
    session.messages,
  )

  for (let attempt = 0; attempt < scorecardAttempts; attempt += 1) {
    const scorecard = parseScorecard(await generateJson(prompt, 'Generate the scorecard.', scorecardSchema))
    if (scorecard) return scorecard
  }

  throw new HttpError(502, 'The AI returned an incomplete scorecard. Please click Complete interview again.')
}

async function applyScorecard(session: StoredInterviewSession) {
  session.scorecard = await generateScorecard(session)
  session.status = 'COMPLETED'
  session.completedAt = new Date().toISOString()
}

export async function startInterviewSession(
  input: { interviewType?: unknown; difficulty?: unknown; questionSet?: unknown },
  uid: string | null,
) {
  const interviewType = interviewTypes.find((type) => type === input.interviewType)
  const difficulty = difficulties.find((level) => level === input.difficulty)
  if (!interviewType || !difficulty) {
    throw new HttpError(400, 'A valid interviewType and difficulty are required.')
  }

  const questionSet = normalizeQuestionSet(input.questionSet)
  const accessKey = randomBytes(32).toString('base64url')
  const session = buildSession(interviewType, difficulty, questionSet)
  session.uid = uid ?? undefined
  session.accessKeyHash = hashAccessKey(accessKey)

  const prompt = createInterviewPrompt(session, questionSet, getSessionDailyVariant(session), 'FIRST_QUESTION')
  const aiText = await generateText(prompt, 'Begin the interview with the first question.')
  session.messages.push(createMessage('AI', aiText))
  session.currentQuestionCount = 1
  updateStateAfterQuestion(session)

  await createInterviewSession(session)
  return { session, accessKey }
}

export async function addInterviewMessage(sessionId: string | undefined, message: unknown, access: SessionAccess) {
  const session = await getAuthorizedSession(sessionId, access)

  if (session.status === 'COMPLETED') {
    throw new HttpError(400, 'Interview already completed.')
  }

  const answer = typeof message === 'string' ? message.trim() : ''
  if (!answer) {
    throw new HttpError(400, 'Message is required.')
  }
  if (answer.length > maxAnswerLength) {
    throw new HttpError(400, `Answers are limited to ${maxAnswerLength} characters.`)
  }

  const aiMessage = await runExclusiveTurn(session, async (current) => {
    current.messages.push(createMessage('USER', answer))

    // That was the answer to the final question: score the interview instead of asking another one.
    if (current.currentQuestionCount >= current.maxQuestions) {
      await applyScorecard(current)
      return null
    }

    const prompt = createInterviewPrompt(current, normalizeQuestionSet(current.questionSet), getSessionDailyVariant(current), 'FOLLOW_UP')
    const turn = parseInterviewTurn(
      await generateJson(prompt, 'Assess the latest candidate answer and continue the interview.', interviewTurnSchema),
    )
    updateStateAfterAnswer(current, turn.answerQuality)

    const nextMessage = createMessage('AI', turn.message)
    current.messages.push(nextMessage)
    current.currentQuestionCount += 1
    updateStateAfterQuestion(current)
    return nextMessage
  })

  return { aiMessage, session }
}

export async function completeInterviewSession(sessionId: string | undefined, access: SessionAccess) {
  const session = await getAuthorizedSession(sessionId, access)

  if (session.status !== 'COMPLETED' || !session.scorecard) {
    await runExclusiveTurn(session, applyScorecard)
  }

  return session
}

export async function transcribeSessionAudio(
  sessionId: string | undefined,
  audioBase64: unknown,
  mimeType: unknown,
  access: SessionAccess,
) {
  if (typeof audioBase64 !== 'string' || !audioBase64 || typeof mimeType !== 'string' || !mimeType.startsWith('audio/')) {
    throw new HttpError(400, 'sessionId, audioBase64, and an audio mimeType are required.')
  }

  const session = await getAuthorizedSession(sessionId, access)
  if (session.status !== 'ACTIVE') {
    throw new HttpError(400, 'Interview already completed.')
  }

  return transcribeAudio(audioBase64, mimeType)
}
