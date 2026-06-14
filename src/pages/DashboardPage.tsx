import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useInterviewStore } from '../store/interviewStore'
import { useAuthStore } from '../store/authStore'
import { Card } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'

export default function DashboardPage() {
  const { sessions, loadSessions, loading, error } = useInterviewStore()
  const { user, loading: authLoading, initializeAuth, signInWithGoogle } = useAuthStore()

  useEffect(() => {
    initializeAuth()
  }, [initializeAuth])

  useEffect(() => {
    if (!authLoading) {
      loadSessions()
    }
  }, [authLoading, loadSessions, user?.uid])

  return (
    <div className="space-y-8">
      <div className="rounded-[2rem] border border-slate-800/80 bg-slate-950/90 p-8 shadow-soft">
        <h1 className="text-4xl font-semibold text-white">Dashboard</h1>
        <p className="mt-3 text-slate-400">
          {user ? 'Review your saved interview sessions and continue practicing anytime.' : 'Sign in to save and review interview history across devices.'}
        </p>
        {!user ? (
          <div className="mt-6">
            <Button onClick={signInWithGoogle} disabled={authLoading}>
              {authLoading ? 'Checking account...' : 'Sign in with Google'}
            </Button>
          </div>
        ) : null}
      </div>

      {error ? <p className="text-sm text-rose-300">{error}</p> : null}
      {(loading || authLoading) && <p className="text-slate-400">Loading sessions...</p>}

      <div className="grid gap-6">
        {sessions.length === 0 ? (
          <Card className="border-slate-800/80 bg-slate-950/90">
            <p className="text-slate-400">You have no sessions yet. Start your first interview from the home page.</p>
            <div className="mt-4">
              <Link to="/select-interview">
                <Button>Start Practice</Button>
              </Link>
            </div>
          </Card>
        ) : (
          sessions.map((session) => (
            <Card key={session.id} className="flex flex-col gap-4 border-slate-800/80">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-sm uppercase tracking-[0.2em] text-slate-500">{session.interviewType.replace('_', ' ')}</p>
                  <h2 className="mt-2 text-2xl font-semibold text-white">{session.difficulty.toLowerCase()} practice</h2>
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
