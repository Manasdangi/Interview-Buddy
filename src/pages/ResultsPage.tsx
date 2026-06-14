import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useInterviewStore } from '../store/interviewStore'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { ScoreCard } from '../components/interview/ScoreCard'
import { Loader } from '../components/ui/Loader'

export default function ResultsPage() {
  const { sessionId } = useParams<{ sessionId: string }>()
  const navigate = useNavigate()
  const { currentSession, loadSession, loading, error } = useInterviewStore()

  useEffect(() => {
    if (sessionId && (!currentSession || currentSession.id !== sessionId)) {
      loadSession(sessionId)
    }
  }, [sessionId])

  if (loading && !currentSession) {
    return <Loader />
  }

  if (!currentSession || !currentSession.scorecard) {
    return <p className="text-slate-300">Results are unavailable. Please complete the interview first.</p>
  }

  return (
    <div className="space-y-8">
      <div className="rounded-[2rem] border border-slate-800/80 bg-slate-950/90 p-8 shadow-soft">
        <h1 className="text-4xl font-semibold text-white">Interview complete</h1>
        <p className="mt-3 text-slate-400">Review your scorecard and recommended topics for the next practice session.</p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
        <ScoreCard scorecard={currentSession.scorecard} />
        <Card className="rounded-[2rem] border-slate-800/80 bg-slate-950/90 p-6 shadow-soft">
          <div className="space-y-5">
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Session summary</p>
              <p className="mt-2 text-slate-300">{currentSession.interviewType.replace('_', ' ')} • {currentSession.difficulty.toLowerCase()}</p>
            </div>
            <div className="rounded-3xl border border-slate-800/80 bg-slate-900 p-4">
              <p className="text-sm font-semibold text-white">Recommended topics</p>
              <ul className="mt-3 space-y-2 text-slate-300">
                {currentSession.scorecard.recommendedTopics.map((topic) => (
                  <li key={topic}>• {topic}</li>
                ))}
              </ul>
            </div>
            <Button onClick={() => navigate('/dashboard')}>Back to dashboard</Button>
          </div>
        </Card>
      </div>
      {error ? <p className="text-sm text-rose-300">{error}</p> : null}
    </div>
  )
}
