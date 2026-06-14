import { Routes, Route, Navigate } from 'react-router-dom'
import HomePage from '../pages/HomePage'
import SelectInterviewPage from '../pages/SelectInterviewPage'
import SelectDifficultyPage from '../pages/SelectDifficultyPage'
import InterviewRoomPage from '../pages/InterviewRoomPage'
import ResultsPage from '../pages/ResultsPage'
import DashboardPage from '../pages/DashboardPage'

export function Router() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/select-interview" element={<SelectInterviewPage />} />
      <Route path="/select-difficulty/:interviewType" element={<SelectDifficultyPage />} />
      <Route path="/interview/:sessionId" element={<InterviewRoomPage />} />
      <Route path="/results/:sessionId" element={<ResultsPage />} />
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
