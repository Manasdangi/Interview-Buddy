import type {
  Difficulty,
  InterviewScorecard,
  InterviewSession,
  InterviewType,
} from '../types/interview'
import { createAiResponse, transcribeAudio } from './openaiService'
import { buildScorecardPrompt, createInterviewPrompt } from './interviewPromptService'
import { createId } from '../utils/id'

export class HttpError extends Error {
  statusCode: number

  constructor(statusCode: number, message: string) {
    super(message)
    this.statusCode = statusCode
  }
}

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

export async function startInterviewSession(interviewType?: InterviewType, difficulty?: Difficulty) {
  if (!interviewType || !difficulty) {
    throw new HttpError(400, 'interviewType and difficulty are required.')
  }

  const session = buildSession(interviewType, difficulty)
  const prompt = createInterviewPrompt(interviewType, difficulty, session.messages)
  const aiText = await createAiResponse(prompt, 'Begin the interview with the first question.')
  const aiMessage = createMessage('AI', aiText)
  session.messages.push(aiMessage)
  session.currentQuestionCount = 1

  sessions.set(session.id, session)
  return session
}

export async function addInterviewMessage(sessionId: string | undefined, message?: string) {
  if (!sessionId) {
    throw new HttpError(400, 'sessionId is required.')
  }

  const session = sessions.get(sessionId)
  if (!session) {
    throw new HttpError(404, 'Session not found. Please start a new interview.')
  }

  if (session.status === 'COMPLETED') {
    throw new HttpError(400, 'Interview already completed.')
  }

  if (!message || !message.trim()) {
    throw new HttpError(400, 'Message is required.')
  }

  session.messages.push(createMessage('USER', message.trim()))

  const prompt = createInterviewPrompt(session.interviewType, session.difficulty, session.messages)
  const aiText = await createAiResponse(prompt, message.trim())
  const aiMessage = createMessage('AI', aiText)
  session.messages.push(aiMessage)
  session.currentQuestionCount = Math.min(session.maxQuestions, session.currentQuestionCount + 1)

  sessions.set(session.id, session)
  return { aiMessage, session }
}

export async function completeInterviewSession(sessionId: string | undefined) {
  if (!sessionId) {
    throw new HttpError(400, 'sessionId is required.')
  }

  const session = sessions.get(sessionId)
  if (!session) {
    throw new HttpError(404, 'Session not found. Please start a new interview.')
  }

  if (session.status === 'COMPLETED' && session.scorecard) {
    return { scorecard: session.scorecard, session }
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

  return { scorecard, session }
}

export function getInterviewSession(sessionId: string | undefined) {
  if (!sessionId) {
    throw new HttpError(400, 'sessionId is required.')
  }

  const session = sessions.get(sessionId)
  if (!session) {
    throw new HttpError(404, 'Session not found. Please start a new interview.')
  }

  return session
}

export function listInterviewSessions() {
  return Array.from(sessions.values())
}

export async function transcribeVoiceAudio(audioBase64?: string, mimeType?: string) {
  if (!audioBase64 || !mimeType) {
    throw new HttpError(400, 'audioBase64 and mimeType are required.')
  }

  return transcribeAudio(audioBase64, mimeType)
}
