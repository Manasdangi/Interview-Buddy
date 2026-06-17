import type { InterviewSession, InterviewSummary } from '../types/interview.js'
import { getFirestoreDb } from './firebaseAdmin.js'

const memorySessions = new Map<string, InterviewSession>()
const memorySummaries = new Map<string, InterviewSummary[]>()
const collectionName = process.env.FIRESTORE_INTERVIEW_SESSIONS_COLLECTION || 'interviewSessions'
const summaryCollectionName = process.env.FIRESTORE_INTERVIEW_SUMMARIES_COLLECTION || 'userInterviewSummaries'

function cleanSession(session: InterviewSession) {
  return JSON.parse(JSON.stringify(session)) as InterviewSession
}

function cleanSummary(summary: InterviewSummary) {
  return JSON.parse(JSON.stringify(summary)) as InterviewSummary
}

async function saveToMemory(session: InterviewSession) {
  memorySessions.set(session.id, session)
}

async function getFromMemory(sessionId: string) {
  return memorySessions.get(sessionId) ?? null
}

async function listFromMemory() {
  return Array.from(memorySessions.values()).sort((a, b) => b.startedAt.localeCompare(a.startedAt))
}

export async function saveInterviewSession(session: InterviewSession) {
  const db = getFirestoreDb()

  if (!db) {
    await saveToMemory(session)
    return
  }

  await db.collection(collectionName).doc(session.id).set(cleanSession(session))
}

export async function getStoredInterviewSession(sessionId: string) {
  const db = getFirestoreDb()

  if (!db) {
    return getFromMemory(sessionId)
  }

  const snapshot = await db.collection(collectionName).doc(sessionId).get()
  if (!snapshot.exists) return null

  return snapshot.data() as InterviewSession
}

export async function listStoredInterviewSessions() {
  const db = getFirestoreDb()

  if (!db) {
    return listFromMemory()
  }

  const snapshot = await db.collection(collectionName).orderBy('startedAt', 'desc').limit(50).get()
  return snapshot.docs.map((doc) => doc.data() as InterviewSession)
}

export async function saveInterviewSummary(summary: InterviewSummary) {
  const db = getFirestoreDb()

  if (!db) {
    const existing = memorySummaries.get(summary.uid) ?? []
    const withoutCurrent = existing.filter((item) => item.sessionId !== summary.sessionId)
    memorySummaries.set(summary.uid, [summary, ...withoutCurrent])
    return
  }

  await db
    .collection(summaryCollectionName)
    .doc(summary.uid)
    .collection('summaries')
    .doc(summary.sessionId)
    .set(cleanSummary(summary), { merge: true })
}

export async function listInterviewSummaries(uid: string) {
  const db = getFirestoreDb()

  if (!db) {
    return (memorySummaries.get(uid) ?? []).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
  }

  const snapshot = await db
    .collection(summaryCollectionName)
    .doc(uid)
    .collection('summaries')
    .orderBy('updatedAt', 'desc')
    .limit(50)
    .get()

  return snapshot.docs.map((doc) => doc.data() as InterviewSummary)
}
