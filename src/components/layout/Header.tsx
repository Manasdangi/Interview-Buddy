import { Link, NavLink } from 'react-router-dom'
import { LogIn, LogOut } from 'lucide-react'
import { useEffect } from 'react'
import { useAuthStore } from '../../store/authStore'
import { cn } from '../../utils/cn'
import { Button } from '../ui/Button'

const navItems = [
  { label: 'Home', to: '/' },
  { label: 'Dashboard', to: '/dashboard' },
]

export function Header() {
  const { authEnabled, authError, authReady, initAuth, signInWithGoogle, signOutUser, user } = useAuthStore()

  useEffect(() => {
    initAuth()
  }, [initAuth])

  return (
    <header className="border-b border-slate-800/70 bg-slate-950/95 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-6 px-6 py-4">
        <Link to="/" className="text-xl font-semibold text-white">
          Interview Buddy
        </Link>
        <nav className="flex flex-wrap items-center justify-end gap-3">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  'rounded-full px-4 py-2 text-sm font-medium transition hover:bg-slate-800/70',
                  isActive ? 'bg-slate-800 text-white' : 'text-slate-400',
                )
              }
            >
              {item.label}
            </NavLink>
          ))}
          <div className="flex items-center gap-2">
            {user ? (
              <>
                <div className="hidden items-center gap-2 rounded-full border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-slate-200 sm:flex">
                  {user.photoURL ? <img src={user.photoURL} alt="" className="h-6 w-6 rounded-full" /> : null}
                  <span className="max-w-[140px] truncate">{user.displayName || user.email || 'Signed in'}</span>
                </div>
                <Button type="button" variant="secondary" className="gap-2 px-4 py-2" onClick={signOutUser}>
                  <LogOut className="h-4 w-4" />
                  Sign out
                </Button>
              </>
            ) : (
              <Button
                type="button"
                variant="secondary"
                className="gap-2 px-4 py-2"
                onClick={signInWithGoogle}
                disabled={!authReady}
                title={authEnabled ? 'Sign in with Google' : 'Add VITE_FIREBASE_* environment variables to enable Google sign-in'}
              >
                <LogIn className="h-4 w-4" />
                Sign in
              </Button>
            )}
          </div>
          {authError ? <p className="basis-full text-right text-xs text-rose-300">{authError}</p> : null}
        </nav>
      </div>
    </header>
  )
}
