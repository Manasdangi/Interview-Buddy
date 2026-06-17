import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useInterviewStore } from '../store/interviewStore'
import { Card } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { useAuthStore } from '../store/authStore'
import { fetchInterviewSummaries } from '../services/interviewApi'
import type { InterviewSummary } from '../types/interview'

export default function DashboardPage() {
  const { sessions, loading, error } = useInterviewStore()
  const { authReady, user } = useAuthStore()
  const [summaries, setSummaries] = useState<InterviewSummary[]>([])
  const [summaryError, setSummaryError] = useState<string | null>(null)

  useEffect(() => {
    if (!authReady || !user) return

    fetchInterviewSummaries()
      .then(setSummaries)
      .catch((summaryFetchError: unknown) => {
        setSummaryError((summaryFetchError as Error).message || 'Unable to load saved summaries.')
      })
  }, [authReady, user])

  const guestSessions = sessions.filter((session) => session.status === 'ACTIVE')

  return (
    <div className="space-y-8">
      <div className="rounded-[2rem] border border-slate-800/80 bg-slate-950/90 p-8 shadow-soft">
        <h1 className="text-4xl font-semibold text-white">Dashboard</h1>
        <p className="mt-3 text-slate-400">
          {user ? 'Review your interview history, including completed and quit sessions.' : 'Continue the active interview saved in this browser tab.'}
        </p>
      </div>

      {error ? <p className="text-sm text-rose-300">{error}</p> : null}
      {summaryError ? <p className="text-sm text-rose-300">{summaryError}</p> : null}
      {loading && <p className="text-slate-400">Loading sessions...</p>}

      <div className="grid gap-6">
        {user ? (
          summaries.length === 0 ? (
            <Card className="border-slate-800/80 bg-slate-950/90">
              <p className="text-slate-400">No saved summaries yet. Complete or quit a signed-in interview to save one.</p>
              <div className="mt-4">
                <Link to="/select-interview">
                  <Button>Start Practice</Button>
                </Link>
              </div>
            </Card>
          ) : (
            summaries.map((summary) => (
              <Card key={summary.sessionId} className="flex flex-col gap-4 border-slate-800/80">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <p className="text-sm uppercase tracking-[0.2em] text-slate-500">{summary.interviewType.replace('_', ' ')}</p>
                    <h2 className="mt-2 text-2xl font-semibold text-white">
                      {summary.difficulty.toLowerCase()} practice · Set {summary.questionSet ?? 1}
                    </h2>
                  </div>
                  <Badge variant={summary.exitReason === 'COMPLETED' ? 'success' : 'primary'}>
                    {summary.exitReason}
                  </Badge>
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                  <p className="text-slate-400">Answered: {summary.questionsAnswered} / {summary.maxQuestions}</p>
                  <p className="text-slate-400">Asked: {summary.questionsAsked} / {summary.maxQuestions}</p>
                  <p className="text-slate-400">Ended: {new Date(summary.endedAt).toLocaleString()}</p>
                </div>
              </Card>
            ))
          )
        ) : guestSessions.length === 0 ? (
          <Card className="border-slate-800/80 bg-slate-950/90">
            <p className="text-slate-400">You have no active browser session. Sign in to save interview summaries across visits.</p>
            <div className="mt-4">
              <Link to="/select-interview">
                <Button>Start Practice</Button>
              </Link>
            </div>
          </Card>
        ) : (
          guestSessions.map((session) => (
            <Card key={session.id} className="flex flex-col gap-4 border-slate-800/80">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-sm uppercase tracking-[0.2em] text-slate-500">{session.interviewType.replace('_', ' ')}</p>
                  <h2 className="mt-2 text-2xl font-semibold text-white">
                    {session.difficulty.toLowerCase()} practice · Set {session.questionSet ?? 1}
                  </h2>
                </div>
                <Badge variant={session.status === 'COMPLETED' ? 'success' : 'primary'}>
                  {session.status}
                </Badge>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <p className="text-slate-400">Questions asked: {session.currentQuestionCount} / {session.maxQuestions}</p>
                <p className="text-slate-400">Started: {new Date(session.startedAt).toLocaleDateString()}</p>
              </div>

              <div className="flex flex-wrap gap-3">
                <Link to={session.status === 'COMPLETED' ? `/results/${session.id}` : `/interview/${session.id}`}>
                  <Button variant="secondary">View session</Button>
                </Link>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
