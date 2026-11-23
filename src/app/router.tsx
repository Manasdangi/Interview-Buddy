import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { Loader } from '../components/ui/Loader'
import HomePage from '../pages/HomePage'
import SelectInterviewPage from '../pages/SelectInterviewPage'
import SelectDifficultyPage from '../pages/SelectDifficultyPage'
import InterviewRoomPage from '../pages/InterviewRoomPage'
import ResultsPage from '../pages/ResultsPage'
import DashboardPage from '../pages/DashboardPage'
import CompaniesPage from '../pages/CompaniesPage'
import CompanyPage from '../pages/CompanyPage'

// The DSA list ships ~190 KB of problems and code, so it loads only when the tab is opened.
const DsaPage = lazy(() => import('../pages/DsaPage'))
const WebBasicsPage = lazy(() => import('../pages/WebBasicsPage'))

export function Router() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/companies" element={<CompaniesPage />} />
      <Route path="/companies/:companyId" element={<CompanyPage />} />
      <Route path="/select-interview" element={<SelectInterviewPage />} />
      <Route path="/select-difficulty/:interviewType" element={<SelectDifficultyPage />} />
      <Route path="/interview/:sessionId" element={<InterviewRoomPage />} />
      <Route path="/results/:sessionId" element={<ResultsPage />} />
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route
        path="/dsa"
        element={
          <Suspense fallback={<Loader />}>
            <DsaPage />
          </Suspense>
        }
      />
      <Route
        path="/web"
        element={
          <Suspense fallback={<Loader />}>
            <WebBasicsPage />
          </Suspense>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
