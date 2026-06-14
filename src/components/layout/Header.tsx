import { Link, NavLink } from 'react-router-dom'
import { cn } from '../../utils/cn'
import { useEffect } from 'react'
import { useAuthStore } from '../../store/authStore'
import { Button } from '../ui/Button'

const navItems = [
  { label: 'Home', to: '/' },
  { label: 'Dashboard', to: '/dashboard' },
]

export function Header() {
  const { user, loading, error, initializeAuth, signInWithGoogle, signOutUser } = useAuthStore()

  useEffect(() => {
    initializeAuth()
  }, [initializeAuth])

  return (
    <header className="border-b border-slate-800/70 bg-slate-950/95 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
        <Link to="/" className="text-xl font-semibold text-white">
          Interview Buddy
        </Link>
        <div className="flex flex-wrap items-center gap-3">
          <nav className="flex items-center gap-3">
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
          </nav>
          {user ? (
            <div className="flex items-center gap-3">
              {user.photoURL ? <img src={user.photoURL} alt="" className="h-9 w-9 rounded-full" /> : null}
              <span className="max-w-40 truncate text-sm text-slate-300">{user.displayName ?? user.email}</span>
              <Button type="button" variant="secondary" className="px-4 py-2" onClick={signOutUser} disabled={loading}>
                Sign out
              </Button>
            </div>
          ) : (
            <Button type="button" variant="secondary" className="px-4 py-2" onClick={signInWithGoogle} disabled={loading}>
              {loading ? 'Checking...' : 'Sign in'}
            </Button>
          )}
        </div>
      </div>
      {error ? <p className="mx-auto max-w-7xl px-6 pb-3 text-sm text-rose-300">{error}</p> : null}
    </header>
  )
}
