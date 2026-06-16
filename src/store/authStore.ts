import { create } from 'zustand'
import { GoogleAuthProvider, onIdTokenChanged, signInWithPopup, signOut, type User } from 'firebase/auth'
import { getFirebaseAuthClient } from '../services/firebase'
import { setAuthToken } from '../services/authToken'

type AuthUser = {
  uid: string
  displayName: string | null
  email: string | null
  photoURL: string | null
}

type AuthState = {
  user: AuthUser | null
  idToken: string | null
  authReady: boolean
  authEnabled: boolean
  authError: string | null
  initAuth: () => void
  signInWithGoogle: () => Promise<void>
  signOutUser: () => Promise<void>
}

let authInitialized = false

function toAuthUser(user: User): AuthUser {
  return {
    uid: user.uid,
    displayName: user.displayName,
    email: user.email,
    photoURL: user.photoURL,
  }
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  idToken: null,
  authReady: false,
  authEnabled: Boolean(getFirebaseAuthClient()),
  authError: null,

  initAuth: () => {
    if (authInitialized) return
    authInitialized = true

    const auth = getFirebaseAuthClient()
    if (!auth) {
      set({ authReady: true, authEnabled: false, user: null, idToken: null })
      setAuthToken(null)
      return
    }

    onIdTokenChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        set({ authReady: true, user: null, idToken: null })
        setAuthToken(null)
        return
      }

      const token = await firebaseUser.getIdToken()
      set({ authReady: true, user: toAuthUser(firebaseUser), idToken: token, authError: null })
      setAuthToken(token)
    })
  },

  signInWithGoogle: async () => {
    const auth = getFirebaseAuthClient()
    if (!auth) {
      set({ authError: 'Firebase web configuration is missing.' })
      return
    }

    try {
      const provider = new GoogleAuthProvider()
      provider.setCustomParameters({ prompt: 'select_account' })
      await signInWithPopup(auth, provider)
    } catch (error) {
      set({ authError: (error as Error).message || 'Unable to sign in with Google.' })
    }
  },

  signOutUser: async () => {
    const auth = getFirebaseAuthClient()
    if (!auth) {
      set({ user: null, idToken: null })
      setAuthToken(null)
      return
    }

    await signOut(auth)
    set({ user: null, idToken: null, authError: null })
    setAuthToken(null)
  },
}))
