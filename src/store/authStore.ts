import { onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth'
import { create } from 'zustand'
import { auth, googleProvider } from '../services/firebase'

export type AuthUser = {
  uid: string
  displayName: string | null
  email: string | null
  photoURL: string | null
}

type AuthState = {
  user: AuthUser | null
  loading: boolean
  error: string | null
  initialized: boolean
  initializeAuth: () => void
  signInWithGoogle: () => Promise<void>
  signOutUser: () => Promise<void>
}

function toAuthUser(user: typeof auth.currentUser): AuthUser | null {
  if (!user) return null

  return {
    uid: user.uid,
    displayName: user.displayName,
    email: user.email,
    photoURL: user.photoURL,
  }
}

let unsubscribeAuth: (() => void) | null = null

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  loading: true,
  error: null,
  initialized: false,

  initializeAuth: () => {
    if (get().initialized) return
    set({ initialized: true, loading: true })
    unsubscribeAuth = onAuthStateChanged(
      auth,
      (user) => set({ user: toAuthUser(user), loading: false, error: null }),
      (error) => set({ error: error.message, loading: false }),
    )
  },

  signInWithGoogle: async () => {
    set({ loading: true, error: null })
    try {
      await signInWithPopup(auth, googleProvider)
    } catch (error) {
      set({ error: (error as Error).message || 'Unable to sign in with Google.', loading: false })
    }
  },

  signOutUser: async () => {
    set({ loading: true, error: null })
    try {
      await signOut(auth)
    } catch (error) {
      set({ error: (error as Error).message || 'Unable to sign out.', loading: false })
    }
  },
}))

export function disposeAuthListener() {
  unsubscribeAuth?.()
  unsubscribeAuth = null
}
