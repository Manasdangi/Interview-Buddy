import { Link, NavLink } from 'react-router-dom'
import { cn } from '../../utils/cn'

const navItems = [
  { label: 'Home', to: '/' },
  { label: 'Dashboard', to: '/dashboard' },
]

export function Header() {
  return (
    <header className="border-b border-slate-800/70 bg-slate-950/95 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-6 px-6 py-4">
        <Link to="/" className="text-xl font-semibold text-white">
          Interview Buddy
        </Link>
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
      </div>
    </header>
  )
}
