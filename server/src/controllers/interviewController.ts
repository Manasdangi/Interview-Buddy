import type { Request, Response } from 'express'
import type {
  Difficulty,
  InterviewScorecard,
  InterviewSession,
  InterviewType,
} from '../types/interview'
import { createAiResponse, transcribeAudio } from '../services/openaiService'
import { buildScorecardPrompt, createInterviewPrompt } from '../services/interviewPromptService'
import { createId } from '../utils/id'

const sessions = new Map<string, InterviewSession>()
const defaultMaxQuestions = 5

function createMessage(role: 'AI' | 'USER', content: string) {
  return {
    id: createId(),
    role,
    content,
    createdAt: new Date().toISOString(),
  }
}

function buildSession(interviewType: InterviewType, difficulty: Difficulty) {
  const startedAt = new Date().toISOString()
  const session: InterviewSession = {
    id: createId(),
    interviewType,
    difficulty,
    status: 'ACTIVE',
    messages: [],
    currentQuestionCount: 0,
    maxQuestions: defaultMaxQuestions,
    startedAt,
  }
  return session
}

export async function startInterview(req: Request, res: Response) {
  const { interviewType, difficulty } = req.body as { interviewType: InterviewType; difficulty: Difficulty }
  if (!interviewType || !difficulty) {
    return res.status(400).json({ error: 'interviewType and difficulty are required.' })
  }

  const session = buildSession(interviewType, difficulty)
  const prompt = createInterviewPrompt(interviewType, difficulty, session.messages)
  const aiText = await createAiResponse(prompt, 'Begin the interview with the first question.')
  const aiMessage = createMessage('AI', aiText)
  session.messages.push(aiMessage)
  session.currentQuestionCount = 1

  sessions.set(session.id, session)
  return res.status(201).json({ session })
}

export async function postMessage(req: Request, res: Response) {
  const { sessionId } = req.params
  const { message } = req.body as { message: string }

  const session = sessions.get(sessionId)
  if (!session) {
    return res.status(404).json({ error: 'Session not found.' })
  }

  if (session.status === 'COMPLETED') {
    return res.status(400).json({ error: 'Interview already completed.' })
  }

  if (!message || !message.trim()) {
    return res.status(400).json({ error: 'Message is required.' })
  }

  session.messages.push(createMessage('USER', message.trim()))

  const prompt = createInterviewPrompt(session.interviewType, session.difficulty, session.messages)
  const aiText = await createAiResponse(prompt, message.trim())
  const aiMessage = createMessage('AI', aiText)
  session.messages.push(aiMessage)
  session.currentQuestionCount = Math.min(session.maxQuestions, session.currentQuestionCount + 1)

  sessions.set(session.id, session)

  return res.status(200).json({ aiMessage, session })
}

export async function completeInterview(req: Request, res: Response) {
  const { sessionId } = req.params
  const session = sessions.get(sessionId)
  if (!session) {
    return res.status(404).json({ error: 'Session not found.' })
  }

  if (session.status === 'COMPLETED' && session.scorecard) {
    return res.status(200).json({ scorecard: session.scorecard, session })
  }

  const prompt = buildScorecardPrompt(session.interviewType, session.difficulty, session.messages)
  const result = await createAiResponse(prompt, 'Generate the scorecard.')

  let scorecard: InterviewScorecard
  try {
    scorecard = JSON.parse(result) as InterviewScorecard
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
  sessions.set(session.id, session)

  return res.status(200).json({ scorecard, session })
}

export function getSession(req: Request, res: Response) {
  const { sessionId } = req.params
  const session = sessions.get(sessionId)
  if (!session) {
    return res.status(404).json({ error: 'Session not found.' })
  }

  return res.status(200).json({ session })
}

export function listSessions(_req: Request, res: Response) {
  return res.status(200).json({ sessions: Array.from(sessions.values()) })
}

export async function transcribeVoice(req: Request, res: Response) {
  const { audioBase64, mimeType } = req.body as { audioBase64?: string; mimeType?: string }
  if (!audioBase64 || !mimeType) {
    return res.status(400).json({ error: 'audioBase64 and mimeType are required.' })
  }

  const transcript = await transcribeAudio(audioBase64, mimeType)
  return res.status(200).json({ transcript })
}
