import { create } from 'zustand'
import type {
  Difficulty,
  InterviewSession,
  InterviewType,
  QuestionSet,
} from '../types/interview'
import {
  completeInterview as completeInterviewApi,
  fetchInterviewSession,
  sendInterviewMessage,
  sendInterviewMessageStream,
  StreamUnavailableError,
  startInterview,
  type CompanyStartOptions,
} from '../services/interviewApi'
import { loadActiveBrowserSession, saveActiveBrowserSession } from '../services/browserSessionStorage'
import { formatErrorMessage } from '../utils/errorMessage'

type InterviewState = {
  currentSession: InterviewSession | null
  sessions: InterviewSession[]
  starting: boolean
  sending: boolean
  completing: boolean
  loadingSession: boolean
  error: string | null
  startInterview: (
    interviewType: InterviewType,
    difficulty: Difficulty,
    questionSet?: QuestionSet,
    company?: CompanyStartOptions,
  ) => Promise<InterviewSession | null>
  /** Interviewer reply text streamed so far for the answer being sent. */
  streamingReply: string | null
  /** Sends an answer; `onDelta` receives the interviewer's reply as it streams (used by live voice). */
  sendAnswer: (message: string, onDelta?: (text: string) => void) => Promise<boolean>
  completeInterview: () => Promise<void>
  setCurrentSession: (session: InterviewSession | null) => void
  resetInterview: () => void
  loadSession: (sessionId: string) => Promise<void>
}

const browserSession = loadActiveBrowserSession()

function replaceSession(sessions: InterviewSession[], session: InterviewSession) {
  return [session, ...sessions.filter((item) => item.id !== session.id)]
}

export const useInterviewStore = create<InterviewState>((set, get) => ({
  currentSession: browserSession,
  sessions: browserSession ? [browserSession] : [],
  starting: false,
  sending: false,
  completing: false,
  loadingSession: false,
  error: null,
  streamingReply: null,

  startInterview: async (interviewType, difficulty, questionSet, company) => {
    set({ starting: true, error: null })
    try {
      const session = await startInterview(interviewType, difficulty, questionSet, company)
      saveActiveBrowserSession(session)
      set((state) => ({ currentSession: session, sessions: replaceSession(state.sessions, session) }))
      return session
    } catch (error) {
      set({ error: formatErrorMessage(error, 'Unable to start interview.') })
      return null
    } finally {
      set({ starting: false })
    }
  },

  sendAnswer: async (message, onDelta) => {
    const session = get().currentSession
    if (!session) {
      set({ error: 'No active session found.' })
      return false
    }

    set({ sending: true, error: null, streamingReply: null })
    try {
      let streamed = false
      const payload = await sendInterviewMessageStream(session.id, message, (text) => {
        streamed = true
        set((state) => ({ streamingReply: (state.streamingReply ?? '') + text }))
        onDelta?.(text)
      }).catch((error: unknown) => {
        // Older deployments have no streaming endpoint: send normally instead.
        if (error instanceof StreamUnavailableError && !streamed) return sendInterviewMessage(session.id, message)
        throw error
      })
      saveActiveBrowserSession(payload.session)
      set((state) => ({
        currentSession: payload.session,
        sessions: replaceSession(state.sessions, payload.session),
      }))
      return true
    } catch (error) {
      set({ error: formatErrorMessage(error, 'Unable to send answer. Please retry.') })
      return false
    } finally {
      set({ sending: false, streamingReply: null })
    }
  },

  completeInterview: async () => {
    const session = get().currentSession
    if (!session) {
      set({ error: 'No active session to complete.' })
      return
    }
    set({ completing: true, error: null })
    try {
      const payload = await completeInterviewApi(session.id)
      saveActiveBrowserSession(null)
      set((state) => ({
        currentSession: payload.session,
        sessions: replaceSession(state.sessions, payload.session),
      }))
    } catch (error) {
      set({ error: formatErrorMessage(error, 'Unable to complete interview.') })
    } finally {
      set({ completing: false })
    }
  },

  setCurrentSession: (session) => {
    saveActiveBrowserSession(session)
    set({ currentSession: session })
  },

  resetInterview: () => {
    saveActiveBrowserSession(null)
    set({ currentSession: null, error: null, starting: false, sending: false, completing: false, loadingSession: false })
  },

  loadSession: async (sessionId) => {
    set({ loadingSession: true, error: null })
    try {
      const session = await fetchInterviewSession(sessionId)
      saveActiveBrowserSession(session)
      set((state) => ({ currentSession: session, sessions: replaceSession(state.sessions, session) }))
    } catch (error) {
      set({ error: formatErrorMessage(error, 'Unable to load session.') })
    } finally {
      set({ loadingSession: false })
    }
  },
}))
