import { HttpError } from '../utils/httpError.js'
import { getFirebaseAuth } from './firebaseAdmin.js'

function getBearerToken(authorization?: string) {
  if (!authorization) return null
  const [scheme, token] = authorization.split(' ')
  return scheme?.toLowerCase() === 'bearer' && token ? token : null
}

/** Returns the signed-in user's uid, null for guests, or throws 401 for an invalid token. */
export async function getRequestUserId(authorization?: string) {
  const token = getBearerToken(authorization)
  if (!token) return null

  const auth = await getFirebaseAuth()
  if (!auth) {
    throw new HttpError(500, 'Sign-in verification is not configured. Set FIREBASE_PROJECT_ID on the backend.')
  }

  try {
    const decoded = await auth.verifyIdToken(token)
    return decoded.uid
  } catch {
    throw new HttpError(401, 'Your sign-in session is invalid or expired. Please sign in again.')
  }
}

export function requireUserId(uid: string | null, message = 'Sign in is required to save interview history.') {
  if (!uid) {
    throw new HttpError(401, message)
  }
  return uid
}
