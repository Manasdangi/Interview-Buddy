import { listInterviewSummaries, saveInterviewSummary } from './interviewSessionRepository.js'
import { requireUserId } from './authService.js'
import { getAuthorizedSession, type SessionAccess } from './interviewSessionService.js'
import type { InterviewExitReason, InterviewSession, InterviewSummary } from '../types/interview.js'

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

/** Records that a signed-in user left an interview. Only server-stored session data is trusted. */
export async function saveQuitSummary(sessionId: string | undefined, access: SessionAccess) {
  const uid = requireUserId(access.uid)
  const session = await getAuthorizedSession(sessionId, access)
  const exitReason: InterviewExitReason = session.status === 'COMPLETED' ? 'COMPLETED' : 'QUIT'

  const summary = buildInterviewSummary(session, uid, exitReason)
  await saveInterviewSummary(summary)
  return summary
}

export async function saveCompletedSummary(session: InterviewSession, uid: string | null) {
  if (!uid || session.status !== 'COMPLETED') return null

  const summary = buildInterviewSummary(session, uid, 'COMPLETED')
  await saveInterviewSummary(summary)
  return summary
}

export async function listSummariesForUser(uid: string | null) {
  return listInterviewSummaries(requireUserId(uid))
}
