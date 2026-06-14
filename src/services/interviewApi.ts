import axios from 'axios'
import type { Difficulty, InterviewSession, InterviewType, InterviewMessage, InterviewScorecard } from '../types/interview'

const client = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isAxiosError<{ error?: string }>(error)) {
      return Promise.reject(new Error(error.response?.data?.error || error.message))
    }

    return Promise.reject(error)
  },
)

export const startInterview = async (interviewType: InterviewType, difficulty: Difficulty) => {
  const response = await client.post<{ session: InterviewSession }>('/interviews/start', {
    interviewType,
    difficulty,
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
  const response = await client.post<{ scorecard: InterviewScorecard; session: InterviewSession }>(
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
