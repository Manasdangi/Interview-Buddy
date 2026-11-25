import { FieldValue } from 'firebase-admin/firestore'
import { HttpError } from '../utils/httpError.js'
import { getFirestoreDb } from './firebaseAdmin.js'

export type SiteStats = { views: number; visitors: number }

const totalsPath = ['siteStats', 'totals'] as const
const visitorsCollection = 'siteVisitors'
const visitorIdPattern = /^[A-Za-z0-9-]{16,64}$/

// Used only when Firestore is not configured (local development).
const memory = { views: 0, visitors: new Set<string>() }

function readTotals(data: Record<string, unknown> | undefined): SiteStats {
  return { views: Number(data?.views) || 0, visitors: Number(data?.visitors) || 0 }
}

export async function getSiteStats(): Promise<SiteStats> {
  const db = getFirestoreDb()
  if (!db) return { views: memory.views, visitors: memory.visitors.size }
  const snapshot = await db.collection(totalsPath[0]).doc(totalsPath[1]).get()
  return readTotals(snapshot.data())
}

/**
 * Counts one visit. `views` goes up on every call; `visitors` only the first time an anonymous,
 * browser-generated id is seen. No names, emails or IP addresses are stored.
 */
export async function recordSiteVisit(visitorId: unknown): Promise<SiteStats> {
  if (typeof visitorId !== 'string' || !visitorIdPattern.test(visitorId)) {
    throw new HttpError(400, 'A valid visitorId is required.')
  }

  const db = getFirestoreDb()
  if (!db) {
    memory.views += 1
    memory.visitors.add(visitorId)
    return { views: memory.views, visitors: memory.visitors.size }
  }

  const totalsRef = db.collection(totalsPath[0]).doc(totalsPath[1])
  const visitorRef = db.collection(visitorsCollection).doc(visitorId)

  return db.runTransaction(async (tx) => {
    const [totals, visitor] = await Promise.all([tx.get(totalsRef), tx.get(visitorRef)])
    const current = readTotals(totals.data())
    const next = { views: current.views + 1, visitors: current.visitors + (visitor.exists ? 0 : 1) }
    if (!visitor.exists) tx.set(visitorRef, { firstSeen: FieldValue.serverTimestamp() })
    tx.set(totalsRef, { ...next, updatedAt: FieldValue.serverTimestamp() })
    return next
  })
}
