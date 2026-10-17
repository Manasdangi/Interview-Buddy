import type { InterviewSession } from '../types/interview'

const activeSessionKey = 'interview-buddy:active-session'
const accessKeysKey = 'interview-buddy:session-access-keys'
const maxStoredAccessKeys = 20

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

type StoredAccessKeys = Array<{ sessionId: string; accessKey: string }>

function readAccessKeys(): StoredAccessKeys {
  try {
    const raw = window.localStorage.getItem(accessKeysKey)
    const parsed: unknown = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? (parsed as StoredAccessKeys) : []
  } catch {
    return []
  }
}

/** Kept in localStorage so this browser can reopen its sessions (and results) in a new tab. */
export function saveSessionAccessKey(sessionId: string, accessKey: string) {
  try {
    const next = [{ sessionId, accessKey }, ...readAccessKeys().filter((item) => item.sessionId !== sessionId)]
    window.localStorage.setItem(accessKeysKey, JSON.stringify(next.slice(0, maxStoredAccessKeys)))
  } catch {
    // Storage can be unavailable (private mode); signed-in users can still reach their sessions.
  }
}

export function getSessionAccessKey(sessionId: string) {
  return readAccessKeys().find((item) => item.sessionId === sessionId)?.accessKey ?? null
}
