import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/react'
import { AppShell } from '../components/layout/AppShell'
import { Router } from './router'
import { BrowserRouter } from 'react-router-dom'

export default function App() {
  return (
    <BrowserRouter>
      <AppShell>
        <Router />
      </AppShell>
      {/* Vercel Web Analytics (visitors, page views) and Speed Insights (real-user Core Web Vitals).
          Both only send data on Vercel deployments and track client-side route changes. */}
      <Analytics />
      <SpeedInsights />
    </BrowserRouter>
  )
}
