import axios from 'axios'
import type {
  CompanyRoleLevel,
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

export type CompanyStartOptions = { companyId: string; role: CompanyRoleLevel }

export const startInterview = async (
  interviewType: InterviewType,
  difficulty: Difficulty,
  questionSet: QuestionSet | undefined,
  company?: CompanyStartOptions,
  resumeBase64?: string,
) => {
  const response = await client.post<{ session: InterviewSession; accessKey: string }>('/interviews/start', {
    interviewType,
    difficulty,
    questionSet,
    ...(company ?? {}),
    ...(resumeBase64 ? { resumeBase64 } : {}),
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

type MessagePayload = { aiMessage: InterviewMessage | null; session: InterviewSession; summary?: InterviewSummary | null }

/** The streaming endpoint is missing (e.g. an older deployment); callers fall back to the normal request. */
export class StreamUnavailableError extends Error {}

/**
 * Sends an answer and streams the interviewer's reply text (`onDelta`) while Claude writes it, so live voice
 * can start speaking before the whole reply is ready. Resolves with the same payload as sendInterviewMessage.
 */
export const sendInterviewMessageStream = async (sessionId: string, message: string, onDelta: (text: string) => void) => {
  const token = getAuthToken()
  const response = await fetch(`${baseURL}/interviews/${sessionId}/message-stream`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...sessionHeaders(sessionId),
    },
    body: JSON.stringify({ message }),
  })
  if (response.status === 404 || response.status === 405 || !response.body) throw new StreamUnavailableError('Streaming unavailable.')
  if (!response.ok) {
    const data = (await response.json().catch(() => ({}))) as { error?: unknown }
    throw new Error(normalizeApiError(data.error) || 'Unable to send answer. Please retry.')
  }

  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let pending = ''
  for (;;) {
    const { value, done } = await reader.read()
    if (value) pending += decoder.decode(value, { stream: true })
    let newline = pending.indexOf('\n')
    while (newline !== -1) {
      const line = pending.slice(0, newline).trim()
      pending = pending.slice(newline + 1)
      newline = pending.indexOf('\n')
      if (!line) continue
      const event = JSON.parse(line) as
        | { type: 'delta'; text: string }
        | ({ type: 'done' } & MessagePayload)
        | { type: 'error'; error: string }
      if (event.type === 'delta') onDelta(event.text)
      else if (event.type === 'error') throw new Error(event.error)
      else return { aiMessage: event.aiMessage, session: event.session, summary: event.summary }
    }
    if (done) throw new Error('The connection closed before the interviewer replied. Please retry.')
  }
}

/** Natural Indian-English interviewer voice streamed as raw 24 kHz mono 16-bit PCM (starts in well under a second). */
export const openSpeechStream = (sessionId: string, text: string, signal: AbortSignal) => {
  const token = getAuthToken()
  return fetch(`${baseURL}/interviews/speech-stream`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...sessionHeaders(sessionId),
    },
    body: JSON.stringify({ sessionId, text }),
    signal,
  })
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
