import type { Request, Response } from 'express'
import type {
  Difficulty,
  InterviewSession,
  InterviewType,
} from '../types/interview'
import {
  addInterviewMessage,
  completeInterviewSession,
  getInterviewSession,
  listInterviewSessions,
  startInterviewSession,
  transcribeVoiceAudio,
} from '../services/interviewSessionService'

export async function startInterview(req: Request, res: Response) {
  const { interviewType, difficulty } = req.body as { interviewType?: InterviewType; difficulty?: Difficulty }
  const session = await startInterviewSession(interviewType, difficulty)
  return res.status(201).json({ session })
}

export async function postMessage(req: Request, res: Response) {
  const { sessionId } = req.params
  const { message, session } = req.body as { message?: string; session?: InterviewSession }
  const payload = await addInterviewMessage(sessionId, message, session)
  return res.status(200).json(payload)
}

export async function completeInterview(req: Request, res: Response) {
  const { sessionId } = req.params
  const { session } = req.body as { session?: InterviewSession }
  const payload = await completeInterviewSession(sessionId, session)
  return res.status(200).json(payload)
}

export function getSession(req: Request, res: Response) {
  const { sessionId } = req.params
  return res.status(200).json({ session: getInterviewSession(sessionId) })
}

export function listSessions(_req: Request, res: Response) {
  return res.status(200).json({ sessions: listInterviewSessions() })
}

export async function transcribeVoice(req: Request, res: Response) {
  const { audioBase64, mimeType } = req.body as { audioBase64?: string; mimeType?: string }
  const transcript = await transcribeVoiceAudio(audioBase64, mimeType)
  return res.status(200).json({ transcript })
}
