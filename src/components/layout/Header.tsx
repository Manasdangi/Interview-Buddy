import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { LogIn, LogOut, Moon, Sun } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useAuthStore } from '../../store/authStore'
import { useInterviewStore } from '../../store/interviewStore'
import { saveQuitSummary } from '../../services/interviewApi'
import { cn } from '../../utils/cn'
import { useTheme } from '../../hooks/useTheme'
import { Button } from '../ui/Button'

const navItems = [
  { label: 'Home', to: '/' },
  { label: 'Companies', to: '/companies' },
  { label: 'DSA', to: '/dsa' },
  { label: 'HTML/CSS/JS', to: '/web' },
  { label: 'Resume ATS', to: '/resume' },
  { label: 'Dashboard', to: '/dashboard' },
]

function getAvatarLabel(name: string | null, email: string | null) {
  const source = (name || email || 'User').trim()
  const parts = source.split(/\s+/).filter(Boolean)

  if (parts.length >= 2) {
    return `${parts[0][0] ?? ''}${parts[1][0] ?? ''}`.toUpperCase()
  }

  return source.slice(0, 2).toUpperCase()
}

export function Header() {
  const { authEnabled, authError, authReady, initAuth, signInWithGoogle, signOutUser, user } = useAuthStore()
  const { currentSession, resetInterview } = useInterviewStore()
  const { theme, toggleTheme } = useTheme()
  const location = useLocation()
  const navigate = useNavigate()
  const [failedPhotoUrl, setFailedPhotoUrl] = useState<string | null>(null)
  const isActiveInterviewRoute = location.pathname.startsWith('/interview/')
  const hasActiveInterview = isActiveInterviewRoute && currentSession?.status === 'ACTIVE'

  useEffect(() => {
    initAuth()
  }, [initAuth])

  const showPhoto = Boolean(user?.photoURL && user.photoURL !== failedPhotoUrl)

  const handleSignOut = async () => {
    if (hasActiveInterview && currentSession) {
      const shouldLeave = window.confirm('If you sign out now, you will lose your interview progress.')
      if (!shouldLeave) return

      await saveQuitSummary(currentSession.id)
      resetInterview()
      navigate('/dashboard')
    }

    await signOutUser()
  }

  return (
    <header className="sticky top-0 z-40 border-b border-slate-800/70 bg-slate-950/85 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-x-6 gap-y-3 px-6 py-4 md:flex-nowrap">
        <Link to="/" className="flex items-center gap-2.5 text-xl font-semibold text-white">
          <img src="/favicon.svg" alt="" className="h-8 w-8" />
          Interview Buddy
        </Link>
        <nav className="contents md:flex md:flex-1 md:flex-wrap md:items-center md:justify-end md:gap-3">
          {/* On phones the links drop to their own scrollable row under the logo and actions. */}
          <div className="order-last -mx-1 flex w-full gap-1 overflow-x-auto px-1 md:order-none md:mx-0 md:w-auto md:flex-wrap md:gap-3 md:overflow-visible md:px-0">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  cn(
                    'shrink-0 whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition hover:bg-slate-800/70',
                    isActive ? 'bg-slate-800 text-white' : 'text-slate-400',
                  )
                }
              >
                {item.label}
              </NavLink>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={toggleTheme}
              aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
              className="grid h-10 w-10 place-items-center rounded-full border border-slate-800 bg-slate-900 text-slate-300 transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              {theme === 'dark' ? <Sun className="h-4 w-4" aria-hidden="true" /> : <Moon className="h-4 w-4" aria-hidden="true" />}
            </button>
            {user ? (
              <>
                <div className="hidden items-center gap-2 rounded-full border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-slate-200 sm:flex">
                  {showPhoto ? (
                    <img
                      src={user.photoURL!}
                      alt={`${user.displayName || user.email || 'User'} profile`}
                      className="h-6 w-6 shrink-0 rounded-full object-cover"
                      referrerPolicy="no-referrer"
                      onError={() => setFailedPhotoUrl(user.photoURL)}
                    />
                  ) : (
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-800 text-[10px] font-semibold text-slate-200">
                      {getAvatarLabel(user.displayName, user.email)}
                    </div>
                  )}
                  <span className="max-w-[140px] truncate">{user.displayName || user.email || 'Signed in'}</span>
                </div>
                <Button type="button" variant="secondary" className="gap-2 px-4 py-2" onClick={handleSignOut}>
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
