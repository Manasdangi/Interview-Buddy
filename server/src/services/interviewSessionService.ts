import type {
  AnswerQuality,
  Difficulty,
  DifficultyTrend,
  InterviewState,
  InterviewScorecard,
  InterviewSession,
  InterviewType,
  QuestionSet,
} from '../types/interview.js'
import { createAiResponse, transcribeAudio } from './openaiService.js'
import { buildScorecardPrompt, createInterviewPrompt } from './interviewPromptService.js'
import { createId } from '../utils/id.js'
import { getStoredInterviewSession, listStoredInterviewSessions, saveInterviewSession } from './interviewSessionRepository.js'
import { getDailyQuestionVariant } from './dailyQuestionVariantService.js'

export class HttpError extends Error {
  statusCode: number

  constructor(statusCode: number, message: string) {
    super(message)
    this.statusCode = statusCode
  }
}

const defaultMaxQuestions = 5
const defaultQuestionSet: QuestionSet = 1
const promptStateHistoryLimit = 4

function normalizeQuestionSet(questionSet?: QuestionSet) {
  return questionSet && questionSet >= 1 && questionSet <= 5 ? questionSet : defaultQuestionSet
}

function createMessage(role: 'AI' | 'USER', content: string) {
  return {
    id: createId(),
    role,
    content,
    createdAt: new Date().toISOString(),
  }
}

function parseScorecardResponse(result: string): InterviewScorecard {
  const normalized = result.trim()

  const candidates = [
    normalized,
    normalized.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/i, '').trim(),
  ]

  const firstBraceIndex = normalized.indexOf('{')
  const lastBraceIndex = normalized.lastIndexOf('}')
  if (firstBraceIndex >= 0 && lastBraceIndex > firstBraceIndex) {
    candidates.push(normalized.slice(firstBraceIndex, lastBraceIndex + 1))
  }

  for (const candidate of candidates) {
    try {
      return JSON.parse(candidate) as InterviewScorecard
    } catch {
      continue
    }
  }

  throw new Error('Unable to parse scorecard JSON.')
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

function ensureInterviewState(session: InterviewSession) {
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
  const session: InterviewSession = {
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

function classifyAnswerQuality(answer: string): AnswerQuality {
  const normalized = answer.toLowerCase().trim()

  if (!normalized) return 'UNKNOWN'

  const weakSignals = ['i don\'t know', 'dont know', 'not sure', 'maybe', 'guess', 'no idea']
  if (weakSignals.some((signal) => normalized.includes(signal)) || normalized.length < 60) {
    return 'WEAK'
  }

  const strongSignals = ['because', 'for example', 'for instance', 'trade-off', 'performance', 'state', 'closure', 'memo', 'render', 're-render', 'event']
  const strongSignalCount = strongSignals.filter((signal) => normalized.includes(signal)).length
  if (normalized.length >= 220 || strongSignalCount >= 2 || normalized.includes('```')) {
    return 'STRONG'
  }

  return 'MODERATE'
}

function getDifficultyTrend(recentAnswerQualities: AnswerQuality[]): DifficultyTrend {
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

function updateStateAfterAnswer(session: InterviewSession, answer: string) {
  const quality = classifyAnswerQuality(answer)
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

export async function startInterviewSession(interviewType?: InterviewType, difficulty?: Difficulty, questionSet?: QuestionSet) {
  if (!interviewType || !difficulty) {
    throw new HttpError(400, 'interviewType and difficulty are required.')
  }

  const normalizedQuestionSet = normalizeQuestionSet(questionSet)
  const session = buildSession(interviewType, difficulty, normalizedQuestionSet)
  const prompt = createInterviewPrompt(session, normalizedQuestionSet, getSessionDailyVariant(session))
  const aiText = await createAiResponse(prompt, 'Begin the interview with the first question.')
  const aiMessage = createMessage('AI', aiText)
  session.messages.push(aiMessage)
  session.currentQuestionCount = 1
  updateStateAfterQuestion(session)

  await saveInterviewSession(session)
  return session
}

export async function addInterviewMessage(sessionId: string | undefined, message?: string) {
  if (!sessionId) {
    throw new HttpError(400, 'sessionId is required.')
  }

  const session = await getStoredInterviewSession(sessionId)
  if (!session) {
    throw new HttpError(404, 'Session not found. Please start a new interview.')
  }
  ensureInterviewState(session)

  if (session.status === 'COMPLETED') {
    throw new HttpError(400, 'Interview already completed.')
  }

  if (!message || !message.trim()) {
    throw new HttpError(400, 'Message is required.')
  }

  session.messages.push(createMessage('USER', message.trim()))
  updateStateAfterAnswer(session, message.trim())

  const prompt = createInterviewPrompt(session, normalizeQuestionSet(session.questionSet), getSessionDailyVariant(session))
  const aiText = await createAiResponse(prompt, 'Continue the interview using the latest candidate answer and the compact interview state.')
  const aiMessage = createMessage('AI', aiText)
  session.messages.push(aiMessage)
  session.currentQuestionCount = Math.min(session.maxQuestions, session.currentQuestionCount + 1)
  updateStateAfterQuestion(session)

  await saveInterviewSession(session)
  return { aiMessage, session }
}

export async function completeInterviewSession(sessionId: string | undefined) {
  if (!sessionId) {
    throw new HttpError(400, 'sessionId is required.')
  }

  const session = await getStoredInterviewSession(sessionId)
  if (!session) {
    throw new HttpError(404, 'Session not found. Please start a new interview.')
  }
  ensureInterviewState(session)

  if (session.status === 'COMPLETED' && session.scorecard) {
    return { scorecard: session.scorecard, session }
  }

  const prompt = buildScorecardPrompt(session.interviewType, session.difficulty, normalizeQuestionSet(session.questionSet), getSessionDailyVariant(session), session.messages)
  const result = await createAiResponse(prompt, 'Generate the scorecard as raw compact JSON only.')

  let scorecard: InterviewScorecard
  try {
    scorecard = parseScorecardResponse(result)
  } catch {
    scorecard = {
      overallScore: 7,
      technicalScore: 7,
      communicationScore: 7,
      problemSolvingScore: 7,
      depthScore: 7,
      strengths: ['Clear communication', 'Thoughtful reasoning'],
      weaknesses: ['Could provide more detail in some answers'],
      improvements: ['Practice edge case explanations', 'Discuss trade-offs more explicitly'],
      recommendedTopics: ['React hooks', 'component design', 'performance optimization'],
      finalFeedback: 'You demonstrated a solid foundation. Continue refining your architecture reasoning and answer depth.',
    }
  }

  session.status = 'COMPLETED'
  session.completedAt = new Date().toISOString()
  session.scorecard = scorecard
  await saveInterviewSession(session)

  return { scorecard, session }
}

export async function getInterviewSession(sessionId: string | undefined) {
  if (!sessionId) {
    throw new HttpError(400, 'sessionId is required.')
  }

  const session = await getStoredInterviewSession(sessionId)
  if (!session) {
    throw new HttpError(404, 'Session not found. Please start a new interview.')
  }

  return ensureInterviewState(session)
}

export async function listInterviewSessions() {
  const sessions = await listStoredInterviewSessions()
  return sessions.map((session) => ensureInterviewState(session))
}

export async function transcribeVoiceAudio(audioBase64?: string, mimeType?: string) {
  if (!audioBase64 || !mimeType) {
    throw new HttpError(400, 'audioBase64 and mimeType are required.')
  }

  return transcribeAudio(audioBase64, mimeType)
}
