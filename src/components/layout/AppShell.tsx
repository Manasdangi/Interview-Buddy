import { useEffect, useState, type ReactNode } from 'react'
import { useLocation } from 'react-router-dom'
import { Header } from './Header'
import { loadSiteStats, type SiteStats } from '../../services/statsApi'

type AppShellProps = {
  children: ReactNode
}

// These pages bring their own full-width "atlas" layout (graph-paper background, sidebar).
const FULL_BLEED = ['/dsa', '/web']

export function AppShell({ children }: AppShellProps) {
  const { pathname } = useLocation()
  const fullBleed = FULL_BLEED.some((path) => pathname === path || pathname.startsWith(`${path}/`))
  const [stats, setStats] = useState<SiteStats | null>(null)
  useEffect(() => {
    let active = true
    loadSiteStats()
      .then((value) => active && setStats(value))
      .catch(() => undefined) // the counter is a nicety; never block the app
    return () => {
      active = false
    }
  }, [])
  const format = (value: number) => value.toLocaleString('en-IN')

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <Header />
      <main className={fullBleed ? undefined : 'mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8'}>{children}</main>
      {stats ? (
        <footer className="border-t border-slate-800/70 py-4 text-center text-xs text-slate-500" aria-label="Site statistics">
          👁 {format(stats.views)} total views · {format(stats.visitors)} unique visitors
        </footer>
      ) : null}
    </div>
  )
}
