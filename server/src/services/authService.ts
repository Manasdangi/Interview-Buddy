import type { JWTVerifyGetKey } from 'jose'
import { HttpError } from '../utils/httpError.js'

// Firebase ID tokens are RS256 JWTs signed with Google's rotating "securetoken" keys.
// Verifying them with `jose` directly avoids firebase-admin/auth, whose jwks-rsa dependency
// require()s an ESM-only `jose` and crashes on Vercel's Node runtime (ERR_REQUIRE_ESM).
const firebaseJwksUrl = new URL('https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com')

let remoteKeys: JWTVerifyGetKey | undefined

// jose is ESM-only, so it is loaded with a dynamic import(): that works whether the function is emitted as ESM or CJS.
async function loadJose() {
  return import('jose')
}

async function getRemoteKeys() {
  if (!remoteKeys) {
    const { createRemoteJWKSet } = await loadJose()
    remoteKeys = createRemoteJWKSet(firebaseJwksUrl)
  }
  return remoteKeys
}

function getBearerToken(authorization?: string) {
  if (!authorization) return null
  const [scheme, token] = authorization.split(' ')
  return scheme?.toLowerCase() === 'bearer' && token ? token : null
}

export function getFirebaseProjectId() {
  return process.env.FIREBASE_PROJECT_ID || process.env.VITE_FIREBASE_PROJECT_ID || null
}

type VerifyOptions = {
  /** Override the signing keys (tests). Defaults to Google's published Firebase keys. */
  keys?: JWTVerifyGetKey
  projectId?: string | null
}

/** Returns the Firebase uid for a valid ID token, or throws 401 / 500 (not configured). */
export async function verifyFirebaseIdToken(token: string, options: VerifyOptions = {}) {
  const projectId = options.projectId === undefined ? getFirebaseProjectId() : options.projectId
  if (!projectId) {
    throw new HttpError(500, 'Sign-in verification is not configured. Set FIREBASE_PROJECT_ID on the backend.')
  }

  try {
    const { jwtVerify } = await loadJose()
    const { payload } = await jwtVerify(token, options.keys ?? (await getRemoteKeys()), {
      algorithms: ['RS256'],
      issuer: `https://securetoken.google.com/${projectId}`,
      audience: projectId,
    })

    if (typeof payload.sub !== 'string' || !payload.sub) {
      throw new Error('Token has no subject.')
    }
    return payload.sub
  } catch {
    throw new HttpError(401, 'Your sign-in session is invalid or expired. Please sign in again.')
  }
}

/** Returns the signed-in user's uid, null for guests, or throws 401 for an invalid token. */
export async function getRequestUserId(authorization?: string) {
  const token = getBearerToken(authorization)
  if (!token) return null

  return verifyFirebaseIdToken(token)
}

export function requireUserId(uid: string | null, message = 'Sign in is required to save interview history.') {
  if (!uid) {
    throw new HttpError(401, message)
  }
  return uid
}
