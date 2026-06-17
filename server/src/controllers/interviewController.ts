import type { Request, Response } from 'express'
import type {
  Difficulty,
  InterviewType,
  QuestionSet,
} from '../types/interview.js'
import {
  addInterviewMessage,
  completeInterviewSession,
  getInterviewSession,
  listInterviewSessions,
  startInterviewSession,
  transcribeVoiceAudio,
} from '../services/interviewSessionService.js'
import { listSummariesForUser, saveSummaryForCompletedSession, saveSummaryForSessionSnapshot } from '../services/interviewSummaryService.js'
import type { InterviewExitReason, InterviewSession } from '../types/interview.js'

export async function startInterview(req: Request, res: Response) {
  const { interviewType, difficulty, questionSet } = req.body as { interviewType?: InterviewType; difficulty?: Difficulty; questionSet?: QuestionSet }
  const session = await startInterviewSession(interviewType, difficulty, questionSet)
  return res.status(201).json({ session })
}

export async function postMessage(req: Request, res: Response) {
  const { sessionId } = req.params
  const { message } = req.body as { message?: string }
  const payload = await addInterviewMessage(sessionId, message)
  return res.status(200).json(payload)
}

export async function completeInterview(req: Request, res: Response) {
  const { sessionId } = req.params
  const payload = await completeInterviewSession(sessionId)
  const summary = await saveSummaryForCompletedSession(payload.session, req.headers.authorization)
  return res.status(200).json({ ...payload, summary })
}

export async function getSession(req: Request, res: Response) {
  const { sessionId } = req.params
  const session = await getInterviewSession(sessionId)
  return res.status(200).json({ session })
}

export async function listSessions(_req: Request, res: Response) {
  const sessions = await listInterviewSessions()
  return res.status(200).json({ sessions })
}

export async function saveSummary(req: Request, res: Response) {
  const { sessionId } = req.params
  const { exitReason = 'QUIT', session } = req.body as { exitReason?: InterviewExitReason; session?: InterviewSession }
  const summary = await saveSummaryForSessionSnapshot(sessionId, req.headers.authorization, exitReason, session)
  return res.status(200).json({ summary })
}

export async function listSummaries(req: Request, res: Response) {
  const summaries = await listSummariesForUser(req.headers.authorization)
  return res.status(200).json({ summaries })
}

export async function transcribeVoice(req: Request, res: Response) {
  const { audioBase64, mimeType } = req.body as { audioBase64?: string; mimeType?: string }
  const transcript = await transcribeVoiceAudio(audioBase64, mimeType)
  return res.status(200).json({ transcript })
}
