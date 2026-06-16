import axios from 'axios'
import type {
  Difficulty,
  InterviewExitReason,
  InterviewMessage,
  InterviewScorecard,
  InterviewSession,
  InterviewSummary,
  InterviewType,
  QuestionSet,
} from '../types/interview'
import { getAuthToken } from './authToken'

const client = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

client.interceptors.request.use((config) => {
  const token = getAuthToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

function normalizeApiError(error: unknown) {
  if (typeof error === 'string') return error

  if (error && typeof error === 'object') {
    const errorRecord = error as Record<string, unknown>
    if (typeof errorRecord.message === 'string') return errorRecord.message
    if (typeof errorRecord.error === 'string') return errorRecord.error
  }

  return null
}

client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isAxiosError<{ error?: unknown }>(error)) {
      const responseError = error.response?.data?.error
      return Promise.reject(new Error(normalizeApiError(responseError) || error.message))
    }

    return Promise.reject(error)
  },
)

export const startInterview = async (interviewType: InterviewType, difficulty: Difficulty, questionSet: QuestionSet) => {
  const response = await client.post<{ session: InterviewSession }>('/interviews/start', {
    interviewType,
    difficulty,
    questionSet,
  })
  return response.data.session
}

export const sendInterviewMessage = async (sessionId: string, message: string) => {
  const response = await client.post<{ aiMessage: InterviewMessage; session: InterviewSession }>(
    `/interviews/${sessionId}/message`,
    { message },
  )
  return response.data
}

export const completeInterview = async (sessionId: string) => {
  const response = await client.post<{ scorecard: InterviewScorecard; session: InterviewSession; summary?: InterviewSummary | null }>(
    `/interviews/${sessionId}/complete`,
  )
  return response.data
}

export const fetchInterviewSession = async (sessionId: string) => {
  const response = await client.get<{ session: InterviewSession }>(`/interviews/${sessionId}`)
  return response.data.session
}

export const fetchInterviewSessions = async () => {
  const response = await client.get<{ sessions: InterviewSession[] }>('/interviews')
  return response.data.sessions
}

export const transcribeVoice = async (audioBase64: string, mimeType: string) => {
  const response = await client.post<{ transcript: string }>('/interviews/transcribe', {
    audioBase64,
    mimeType,
  })
  return response.data.transcript
}

export const saveInterviewSummary = async (sessionId: string, exitReason: InterviewExitReason, options?: { keepalive?: boolean }) => {
  const token = getAuthToken()
  if (!token) return null

  const baseUrl = import.meta.env.VITE_API_BASE_URL || '/api'
  const response = await fetch(`${baseUrl}/interviews/${sessionId}/summary`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ exitReason }),
    keepalive: options?.keepalive,
  })

  if (!response.ok) return null

  const data = (await response.json()) as { summary: InterviewSummary }
  return data.summary
}

export const fetchInterviewSummaries = async () => {
  const response = await client.get<{ summaries: InterviewSummary[] }>('/interviews/summaries')
  return response.data.summaries
}
