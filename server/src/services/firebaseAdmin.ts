import { applicationDefault, cert, getApps, initializeApp } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'

type FirebaseServiceAccount = {
  projectId: string
  clientEmail: string
  privateKey: string
}

function decodeServiceAccountJson() {
  const encoded = process.env.FIREBASE_SERVICE_ACCOUNT_BASE64
  const json = process.env.FIREBASE_SERVICE_ACCOUNT_JSON
  const raw = encoded ? Buffer.from(encoded, 'base64').toString('utf8') : json

  if (!raw) return null

  const parsed = JSON.parse(raw) as {
    project_id?: string
    client_email?: string
    private_key?: string
  }

  if (!parsed.project_id || !parsed.client_email || !parsed.private_key) {
    throw new Error('Firebase service account JSON must include project_id, client_email, and private_key.')
  }

  return {
    projectId: parsed.project_id,
    clientEmail: parsed.client_email,
    privateKey: parsed.private_key,
  }
}

function getServiceAccountFromEnv(): FirebaseServiceAccount | null {
  const jsonAccount = decodeServiceAccountJson()
  if (jsonAccount) return jsonAccount

  const projectId = process.env.FIREBASE_PROJECT_ID
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')

  if (!projectId && !clientEmail && !privateKey) return null

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error('FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY must all be set for Firebase Admin.')
  }

  return { projectId, clientEmail, privateKey }
}

function getFirebaseAdminApp() {
  const serviceAccount = getServiceAccountFromEnv()

  if (!serviceAccount && !process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    return null
  }

  if (!getApps().length) {
    initializeApp({
      credential: serviceAccount
        ? cert({
            projectId: serviceAccount.projectId,
            clientEmail: serviceAccount.clientEmail,
            privateKey: serviceAccount.privateKey,
          })
        : applicationDefault(),
    })
  }

  return getApps()[0]
}

export function getFirestoreDb() {
  const app = getFirebaseAdminApp()
  return app ? getFirestore(app) : null
}

export async function getFirebaseAuth() {
  const app = getFirebaseAdminApp()
  if (!app) {
    return null
  }

  const { getAuth } = await import('firebase-admin/auth')
  return getAuth(app)
}
