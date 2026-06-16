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
  fetchInterviewSessions,
  sendInterviewMessage,
  startInterview,
} from '../services/interviewApi'
import { loadActiveBrowserSession, saveActiveBrowserSession } from '../services/browserSessionStorage'
import { formatErrorMessage } from '../utils/errorMessage'

type InterviewState = {
  currentSession: InterviewSession | null
  sessions: InterviewSession[]
  loading: boolean
  error: string | null
  startInterview: (interviewType: InterviewType, difficulty: Difficulty, questionSet: QuestionSet) => Promise<InterviewSession | null>
  sendAnswer: (message: string) => Promise<boolean>
  completeInterview: () => Promise<void>
  setCurrentSession: (session: InterviewSession | null) => void
  resetInterview: () => void
  loadSession: (sessionId: string) => Promise<void>
  loadSessions: () => Promise<void>
}

const browserSession = loadActiveBrowserSession()

export const useInterviewStore = create<InterviewState>((set, get) => ({
  currentSession: browserSession,
  sessions: browserSession ? [browserSession] : [],
  loading: false,
  error: null,

  startInterview: async (interviewType, difficulty, questionSet) => {
    set({ loading: true, error: null })
    try {
      const session = await startInterview(interviewType, difficulty, questionSet)
      saveActiveBrowserSession(session)
      set({ currentSession: session, sessions: [session, ...get().sessions] })
      return session
    } catch (error) {
      set({ error: formatErrorMessage(error, 'Unable to start interview.') })
      return null
    } finally {
      set({ loading: false })
    }
  },

  sendAnswer: async (message) => {
    const session = get().currentSession
    if (!session) {
      set({ error: 'No active session found.' })
      return false
    }

    set({ loading: true, error: null })
    try {
      const payload = await sendInterviewMessage(session.id, message)
      saveActiveBrowserSession(payload.session)
      set((state) => ({
        currentSession: payload.session,
        sessions: state.sessions.map((item) =>
          item.id === payload.session.id ? payload.session : item,
        ),
      }))
      return true
    } catch (error) {
      set({ error: formatErrorMessage(error, 'Unable to send answer. Please retry.') })
      return false
    } finally {
      set({ loading: false })
    }
  },

  completeInterview: async () => {
    const session = get().currentSession
    if (!session) {
      set({ error: 'No active session to complete.' })
      return
    }
    set({ loading: true, error: null })
    try {
      const payload = await completeInterviewApi(session.id)
      saveActiveBrowserSession(null)
      set((state) => ({
        currentSession: payload.session,
        sessions: state.sessions.map((item) =>
          item.id === payload.session.id ? payload.session : item,
        ),
      }))
    } catch (error) {
      set({ error: formatErrorMessage(error, 'Unable to complete interview.') })
    } finally {
      set({ loading: false })
    }
  },

  setCurrentSession: (session) => {
    saveActiveBrowserSession(session)
    set({ currentSession: session })
  },

  resetInterview: () => {
    saveActiveBrowserSession(null)
    set({ currentSession: null, error: null, loading: false })
  },

  loadSession: async (sessionId) => {
    set({ loading: true, error: null })
    try {
      const session = await fetchInterviewSession(sessionId)
      saveActiveBrowserSession(session)
      set({ currentSession: session, sessions: [session, ...get().sessions.filter((s) => s.id !== session.id)] })
    } catch (error) {
      set({ error: formatErrorMessage(error, 'Unable to load session.') })
    } finally {
      set({ loading: false })
    }
  },

  loadSessions: async () => {
    set({ loading: true, error: null })
    try {
      const sessions = await fetchInterviewSessions()
      set({ sessions })
    } catch (error) {
      set({ error: formatErrorMessage(error, 'Unable to load sessions.') })
    } finally {
      set({ loading: false })
    }
  },
}))
