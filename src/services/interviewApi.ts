import axios from 'axios'
import type {
  Difficulty,
  InterviewMessage,
  InterviewScorecard,
  InterviewSession,
  InterviewSummary,
  InterviewType,
  QuestionSet,
} from '../types/interview'
import { getAuthToken } from './authToken'
import { getSessionAccessKey, saveSessionAccessKey } from './browserSessionStorage'

const baseURL = import.meta.env.VITE_API_BASE_URL || '/api'

const client = axios.create({
  baseURL,
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

/** Proves this browser created the session; signed-in users are also recognised by their token. */
function sessionHeaders(sessionId: string): Record<string, string> {
  const accessKey = getSessionAccessKey(sessionId)
  return accessKey ? { 'X-Session-Key': accessKey } : {}
}

export const startInterview = async (interviewType: InterviewType, difficulty: Difficulty, questionSet: QuestionSet) => {
  const response = await client.post<{ session: InterviewSession; accessKey: string }>('/interviews/start', {
    interviewType,
    difficulty,
    questionSet,
  })
  saveSessionAccessKey(response.data.session.id, response.data.accessKey)
  return response.data.session
}

export const sendInterviewMessage = async (sessionId: string, message: string) => {
  const response = await client.post<{ aiMessage: InterviewMessage | null; session: InterviewSession; summary?: InterviewSummary | null }>(
    `/interviews/${sessionId}/message`,
    { message },
    { headers: sessionHeaders(sessionId) },
  )
  return response.data
}

export const completeInterview = async (sessionId: string) => {
  const response = await client.post<{ scorecard: InterviewScorecard; session: InterviewSession; summary?: InterviewSummary | null }>(
    `/interviews/${sessionId}/complete`,
    undefined,
    { headers: sessionHeaders(sessionId) },
  )
  return response.data
}

export const fetchInterviewSession = async (sessionId: string) => {
  const response = await client.get<{ session: InterviewSession }>(`/interviews/${sessionId}`, {
    headers: sessionHeaders(sessionId),
  })
  return response.data.session
}

export const transcribeVoice = async (sessionId: string, audioBase64: string, mimeType: string) => {
  const response = await client.post<{ transcript: string }>(
    '/interviews/transcribe',
    { sessionId, audioBase64, mimeType },
    { headers: sessionHeaders(sessionId) },
  )
  return response.data.transcript
}

/**
 * Records a quit in the signed-in user's history. Uses `fetch` with `keepalive` so it can finish
 * while the page unloads (unlike `sendBeacon`, it can carry the Authorization header).
 */
export const saveQuitSummary = async (sessionId: string, options?: { keepalive?: boolean }) => {
  const token = getAuthToken()
  if (!token) return null

  const response = await fetch(`${baseURL}/interviews/${sessionId}/summary`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...sessionHeaders(sessionId),
    },
    body: '{}',
    keepalive: options?.keepalive,
  })

  if (!response.ok) return null

  const data = (await response.json()) as { summary: InterviewSummary }
  return data.summary
}

export const fetchInterviewSummaries = async () => {
  const response = await client.get<{ summaries: InterviewSummary[] }>('/interviews/history')
  return response.data.summaries
}
