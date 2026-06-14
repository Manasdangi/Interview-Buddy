import { create } from 'zustand'
import type {
  Difficulty,
  InterviewSession,
  InterviewType,
} from '../types/interview'
import {
  completeInterview as completeInterviewApi,
  fetchInterviewSession,
  fetchInterviewSessions,
  sendInterviewMessage,
  startInterview,
} from '../services/interviewApi'
import {
  fetchSavedInterviewSession,
  fetchSavedInterviewSessions,
  saveInterviewSession,
} from '../services/interviewHistory'
import { useAuthStore } from './authStore'

type InterviewState = {
  currentSession: InterviewSession | null
  sessions: InterviewSession[]
  loading: boolean
  error: string | null
  startInterview: (interviewType: InterviewType, difficulty: Difficulty) => Promise<InterviewSession | null>
  sendAnswer: (message: string) => Promise<boolean>
  completeInterview: () => Promise<void>
  setCurrentSession: (session: InterviewSession | null) => void
  resetInterview: () => void
  loadSession: (sessionId: string) => Promise<void>
  loadSessions: () => Promise<void>
}

export const useInterviewStore = create<InterviewState>((set, get) => ({
  currentSession: null,
  sessions: [],
  loading: false,
  error: null,

  startInterview: async (interviewType, difficulty) => {
    set({ loading: true, error: null })
    try {
      const session = await startInterview(interviewType, difficulty)
      await saveInterviewSession(useAuthStore.getState().user?.uid, session)
      set({ currentSession: session, sessions: [session, ...get().sessions] })
      return session
    } catch (error) {
      set({ error: (error as Error).message || 'Unable to start interview.' })
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
      const payload = await sendInterviewMessage(session, message)
      await saveInterviewSession(useAuthStore.getState().user?.uid, payload.session)
      set((state) => ({
        currentSession: payload.session,
        sessions: state.sessions.map((item) =>
          item.id === payload.session.id ? payload.session : item,
        ),
      }))
      return true
    } catch (error) {
      set({ error: `${(error as Error).message || 'Unable to send answer.'} Please retry.` })
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
      const payload = await completeInterviewApi(session)
      await saveInterviewSession(useAuthStore.getState().user?.uid, payload.session)
      set((state) => ({
        currentSession: payload.session,
        sessions: state.sessions.map((item) =>
          item.id === payload.session.id ? payload.session : item,
        ),
      }))
    } catch (error) {
      set({ error: (error as Error).message || 'Unable to complete interview.' })
    } finally {
      set({ loading: false })
    }
  },

  setCurrentSession: (session) => set({ currentSession: session }),

  resetInterview: () => set({ currentSession: null, error: null, loading: false }),

  loadSession: async (sessionId) => {
    set({ loading: true, error: null })
    try {
      const savedSession = await fetchSavedInterviewSession(useAuthStore.getState().user?.uid, sessionId)
      const session = savedSession ?? (await fetchInterviewSession(sessionId))
      set({ currentSession: session, sessions: [session, ...get().sessions.filter((s) => s.id !== session.id)] })
    } catch (error) {
      set({ error: (error as Error).message || 'Unable to load session.' })
    } finally {
      set({ loading: false })
    }
  },

  loadSessions: async () => {
    set({ loading: true, error: null })
    try {
      const userId = useAuthStore.getState().user?.uid
      const sessions = userId ? await fetchSavedInterviewSessions(userId) : await fetchInterviewSessions()
      set({ sessions })
    } catch (error) {
      set({ error: (error as Error).message || 'Unable to load sessions.' })
    } finally {
      set({ loading: false })
    }
  },
}))
