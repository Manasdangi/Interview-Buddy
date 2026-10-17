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
  startInterview,
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
  startInterview: (interviewType: InterviewType, difficulty: Difficulty, questionSet: QuestionSet) => Promise<InterviewSession | null>
  sendAnswer: (message: string) => Promise<boolean>
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

  startInterview: async (interviewType, difficulty, questionSet) => {
    set({ starting: true, error: null })
    try {
      const session = await startInterview(interviewType, difficulty, questionSet)
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

  sendAnswer: async (message) => {
    const session = get().currentSession
    if (!session) {
      set({ error: 'No active session found.' })
      return false
    }

    set({ sending: true, error: null })
    try {
      const payload = await sendInterviewMessage(session.id, message)
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
      set({ sending: false })
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
