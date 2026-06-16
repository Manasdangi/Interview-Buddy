import type { InterviewSession } from '../types/interview'

const activeSessionKey = 'interview-buddy:active-session'

function canUseSessionStorage() {
  return typeof window !== 'undefined' && Boolean(window.sessionStorage)
}

export function loadActiveBrowserSession() {
  if (!canUseSessionStorage()) return null

  try {
    const raw = window.sessionStorage.getItem(activeSessionKey)
    return raw ? (JSON.parse(raw) as InterviewSession) : null
  } catch {
    window.sessionStorage.removeItem(activeSessionKey)
    return null
  }
}

export function saveActiveBrowserSession(session: InterviewSession | null) {
  if (!canUseSessionStorage()) return

  if (!session || session.status !== 'ACTIVE') {
    window.sessionStorage.removeItem(activeSessionKey)
    return
  }

  window.sessionStorage.setItem(activeSessionKey, JSON.stringify(session))
}
