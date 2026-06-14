import {
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
} from 'firebase/firestore'
import { db } from './firebase'
import type { InterviewSession } from '../types/interview'

type StoredInterviewSession = InterviewSession & {
  ownerId: string
  updatedAt?: unknown
}

function sessionsCollection(userId: string) {
  return collection(db, 'users', userId, 'sessions')
}

export async function saveInterviewSession(userId: string | undefined, session: InterviewSession) {
  if (!userId) return

  await setDoc(
    doc(sessionsCollection(userId), session.id),
    {
      ...session,
      ownerId: userId,
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  )
}

export async function fetchSavedInterviewSession(userId: string | undefined, sessionId: string) {
  if (!userId) return null

  const snapshot = await getDoc(doc(sessionsCollection(userId), sessionId))
  if (!snapshot.exists()) return null

  const data = snapshot.data() as StoredInterviewSession
  const { ownerId: _ownerId, updatedAt: _updatedAt, ...session } = data
  void _ownerId
  void _updatedAt
  return session
}

export async function fetchSavedInterviewSessions(userId: string | undefined) {
  if (!userId) return []

  const snapshot = await getDocs(query(sessionsCollection(userId), orderBy('updatedAt', 'desc')))
  return snapshot.docs.map((item) => {
    const data = item.data() as StoredInterviewSession
    const { ownerId: _ownerId, updatedAt: _updatedAt, ...session } = data
    void _ownerId
    void _updatedAt
    return session
  })
}
