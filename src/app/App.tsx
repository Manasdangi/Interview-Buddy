import { AppShell } from '../components/layout/AppShell'
import { Router } from './router'
import { BrowserRouter } from 'react-router-dom'

export default function App() {
  return (
    <BrowserRouter>
      <AppShell>
        <Router />
      </AppShell>
    </BrowserRouter>
  )
}
