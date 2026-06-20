import { getStoredInterviewSession, listInterviewSummaries, saveInterviewSummary } from './interviewSessionRepository.js'
import type { InterviewExitReason, InterviewSession, InterviewSummary } from '../types/interview.js'

export class AuthError extends Error {
  statusCode: number

  constructor(statusCode: number, message: string) {
    super(message)
    this.statusCode = statusCode
  }
}

function getBearerToken(authorization?: string) {
  if (!authorization) return null
  const [scheme, token] = authorization.split(' ')
  return scheme?.toLowerCase() === 'bearer' && token ? token : null
}

async function requireUserId(authorization?: string) {
  const token = getBearerToken(authorization)
  if (!token) {
    throw new AuthError(401, 'Sign in is required to save interview history.')
  }

  const apiKey = process.env.FIREBASE_WEB_API_KEY || process.env.VITE_FIREBASE_API_KEY
  if (!apiKey) {
    throw new AuthError(500, 'Firebase web API key is required to save interview history.')
  }

  const response = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${apiKey}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ idToken: token }),
  })

  if (!response.ok) {
    throw new AuthError(401, 'Your sign-in session is invalid or expired. Please sign in again.')
  }

  const payload = (await response.json()) as {
    users?: Array<{
      localId?: string
    }>
  }

  const uid = payload.users?.[0]?.localId
  if (!uid) {
    throw new AuthError(401, 'Unable to verify the signed-in user.')
  }

  return uid
}

function getQuestionsAnswered(session: InterviewSession) {
  return session.messages.filter((message) => message.role === 'USER').length
}

function getDurationSeconds(session: InterviewSession, endedAt: string) {
  return Math.max(0, Math.floor((new Date(endedAt).getTime() - new Date(session.startedAt).getTime()) / 1000))
}

function buildInterviewSummary(session: InterviewSession, uid: string, exitReason: InterviewExitReason): InterviewSummary {
  const now = new Date().toISOString()
  const endedAt = session.completedAt ?? now

  return {
    sessionId: session.id,
    uid,
    interviewType: session.interviewType,
    difficulty: session.difficulty,
    questionSet: session.questionSet,
    status: session.status,
    exitReason,
    questionsAsked: session.currentQuestionCount,
    questionsAnswered: getQuestionsAnswered(session),
    maxQuestions: session.maxQuestions,
    startedAt: session.startedAt,
    endedAt,
    durationSeconds: getDurationSeconds(session, endedAt),
    overallScore: session.scorecard?.overallScore,
    createdAt: now,
    updatedAt: now,
  }
}

export async function saveSummaryForSession(sessionId: string | undefined, authorization: string | undefined, exitReason: InterviewExitReason) {
  if (!sessionId) {
    throw new AuthError(400, 'sessionId is required.')
  }

  const uid = await requireUserId(authorization)
  const session = await getStoredInterviewSession(sessionId)

  if (!session) {
    throw new AuthError(404, 'Session not found. Please start a new interview.')
  }

  const summary = buildInterviewSummary(session, uid, exitReason)
  await saveInterviewSummary(summary)
  return summary
}

export async function saveSummaryForSessionSnapshot(
  sessionId: string | undefined,
  authorization: string | undefined,
  exitReason: InterviewExitReason,
  sessionSnapshot?: InterviewSession,
) {
  if (!sessionId) {
    throw new AuthError(400, 'sessionId is required.')
  }

  const uid = await requireUserId(authorization)
  const storedSession = await getStoredInterviewSession(sessionId)
  const session = storedSession ?? (sessionSnapshot?.id === sessionId ? sessionSnapshot : null)

  if (!session) {
    throw new AuthError(404, 'Session not found. Please start a new interview.')
  }

  const summary = buildInterviewSummary(session, uid, exitReason)
  await saveInterviewSummary(summary)
  return summary
}

export async function saveSummaryForCompletedSession(session: InterviewSession, authorization?: string) {
  const token = getBearerToken(authorization)
  if (!token) return null

  const uid = await requireUserId(authorization)
  const summary = buildInterviewSummary(session, uid, 'COMPLETED')
  await saveInterviewSummary(summary)
  return summary
}

export async function listSummariesForUser(authorization: string | undefined) {
  const uid = await requireUserId(authorization)
  return listInterviewSummaries(uid)
}
