import type { Firestore } from 'firebase-admin/firestore'
import type { InterviewSummary, StoredInterviewSession } from '../types/interview.js'
import { HttpError } from '../utils/httpError.js'
import { getFirestoreDb } from './firebaseAdmin.js'

const memorySessions = new Map<string, StoredInterviewSession>()
const memorySummaries = new Map<string, InterviewSummary[]>()
const collectionName = process.env.FIRESTORE_INTERVIEW_SESSIONS_COLLECTION || 'interviewSessions'
const summaryCollectionName = process.env.FIRESTORE_INTERVIEW_SUMMARIES_COLLECTION || 'userInterviewSummaries'

const versionConflictMessage = 'This interview was updated by another request. Reload the page to continue.'

function clean<T>(value: T) {
  return JSON.parse(JSON.stringify(value)) as T
}

function isDeployedRuntime() {
  return (
    process.env.NODE_ENV === 'production' ||
    process.env.VERCEL_ENV === 'production' ||
    process.env.VERCEL_ENV === 'preview'
  )
}

/** Returns null when the in-memory store should be used (local development only). */
function getDb(): Firestore | null {
  const db = getFirestoreDb()
  if (db) return db

  // In-memory data is not shared between serverless instances, so deployed environments must use Firestore.
  if (isDeployedRuntime() && process.env.ALLOW_IN_MEMORY_STORE !== 'true') {
    throw new HttpError(500, 'Firestore is not configured. Add Firebase Admin credentials to the backend environment.')
  }

  return null
}

function sessionsCollection(db: Firestore) {
  return db.collection(collectionName)
}

function summariesCollection(db: Firestore, uid: string) {
  return db.collection(summaryCollectionName).doc(uid).collection('summaries')
}

export async function createInterviewSession(session: StoredInterviewSession) {
  session.version = 1
  const db = getDb()

  if (!db) {
    memorySessions.set(session.id, clean(session))
    return
  }

  await sessionsCollection(db).doc(session.id).create(clean(session))
}

/** Saves the session only if nobody else saved it since `expectedVersion` was read. */
export async function updateInterviewSession(session: StoredInterviewSession, expectedVersion: number) {
  const next = clean({ ...session, version: expectedVersion + 1 })
  const db = getDb()

  if (!db) {
    const current = memorySessions.get(session.id)
    if (!current || (current.version ?? 0) !== expectedVersion) {
      throw new HttpError(409, versionConflictMessage)
    }
    memorySessions.set(session.id, next)
  } else {
    const ref = sessionsCollection(db).doc(session.id)
    await db.runTransaction(async (transaction) => {
      const snapshot = await transaction.get(ref)
      const currentVersion = (snapshot.data() as StoredInterviewSession | undefined)?.version ?? 0
      if (!snapshot.exists || currentVersion !== expectedVersion) {
        throw new HttpError(409, versionConflictMessage)
      }
      transaction.set(ref, next)
    })
  }

  session.version = next.version
}

export async function getStoredInterviewSession(sessionId: string) {
  const db = getDb()

  if (!db) {
    const session = memorySessions.get(sessionId)
    return session ? clean(session) : null
  }

  const snapshot = await sessionsCollection(db).doc(sessionId).get()
  if (!snapshot.exists) return null

  return snapshot.data() as StoredInterviewSession
}

export async function saveInterviewSummary(summary: InterviewSummary) {
  const db = getDb()

  if (!db) {
    const existing = memorySummaries.get(summary.uid) ?? []
    const withoutCurrent = existing.filter((item) => item.sessionId !== summary.sessionId)
    memorySummaries.set(summary.uid, [clean(summary), ...withoutCurrent])
    return
  }

  await summariesCollection(db, summary.uid).doc(summary.sessionId).set(clean(summary), { merge: true })
}

export async function getInterviewSummary(uid: string, sessionId: string) {
  const db = getDb()

  if (!db) {
    return memorySummaries.get(uid)?.find((item) => item.sessionId === sessionId) ?? null
  }

  const snapshot = await summariesCollection(db, uid).doc(sessionId).get()
  return snapshot.exists ? (snapshot.data() as InterviewSummary) : null
}

export async function listInterviewSummaries(uid: string) {
  const db = getDb()

  if (!db) {
    return [...(memorySummaries.get(uid) ?? [])].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
  }

  const snapshot = await summariesCollection(db, uid).orderBy('updatedAt', 'desc').limit(50).get()
  return snapshot.docs.map((doc) => doc.data() as InterviewSummary)
}
