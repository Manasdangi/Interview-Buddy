import type { ReactNode } from 'react'
import { useLocation } from 'react-router-dom'
import { Header } from './Header'

type AppShellProps = {
  children: ReactNode
}

// These pages bring their own full-width "atlas" layout (graph-paper background, sidebar).
const FULL_BLEED = ['/dsa', '/web']

export function AppShell({ children }: AppShellProps) {
  const { pathname } = useLocation()
  const fullBleed = FULL_BLEED.some((path) => pathname === path || pathname.startsWith(`${path}/`))
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <Header />
      <main className={fullBleed ? undefined : 'mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8'}>{children}</main>
    </div>
  )
}
