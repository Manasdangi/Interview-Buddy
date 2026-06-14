import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { useInterviewStore } from '../store/interviewStore'
import type { Difficulty, InterviewType } from '../types/interview'

const difficulties: Array<{ label: string; value: Difficulty; description: string }> = [
  { label: 'Beginner', value: 'BEGINNER', description: 'Simple concepts and easy walkthroughs.' },
  { label: 'Intermediate', value: 'INTERMEDIATE', description: 'Balanced challenges with deeper follow-ups.' },
  { label: 'Advanced', value: 'ADVANCED', description: 'Harder scenarios and architecture-level nuance.' },
]

const interviewCopy: Record<string, string> = {
  ROUND_1: 'Round 1: JavaScript, React fundamentals, HTML/CSS basics.',
  ROUND_2: 'Round 2: Advanced React, machine coding and frontend performance.',
  SYSTEM_DESIGN: 'System Design: Frontend architecture, scalability, and product trade-offs.',
}

export default function SelectDifficultyPage() {
  const { interviewType } = useParams<{ interviewType: string }>()
  const [selected, setSelected] = useState<Difficulty>('BEGINNER')
  const navigate = useNavigate()
  const { startInterview, loading, error } = useInterviewStore()

  const heading = useMemo(() => interviewCopy[interviewType ?? 'ROUND_1'], [interviewType])

  const handleStart = async () => {
    if (!interviewType) return
    const session = await startInterview(interviewType as InterviewType, selected)
    if (session) {
      navigate(`/interview/${session.id}`)
    }
  }

  return (
    <div className="space-y-8">
      <div className="rounded-[2rem] border border-slate-800/80 bg-slate-950/90 p-8 shadow-soft">
        <h1 className="text-4xl font-semibold text-white">Choose a difficulty</h1>
        <p className="mt-3 text-slate-400">{heading}</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {difficulties.map((item) => (
          <Card
            key={item.value}
            className={`cursor-pointer border ${selected === item.value ? 'border-indigo-400/80 bg-slate-900' : 'border-slate-800/80 bg-slate-950/90'} hover:border-indigo-300/70`}
            onClick={() => setSelected(item.value)}
          >
            <h2 className="text-2xl font-semibold text-white">{item.label}</h2>
            <p className="mt-3 text-slate-400">{item.description}</p>
          </Card>
        ))}
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {error ? <p className="text-sm text-rose-300">{error}</p> : null}
        <div className="flex items-center gap-3">
          <Button onClick={handleStart} disabled={loading}>
            {loading ? 'Starting...' : 'Start Interview'}
          </Button>
          <a href="/select-interview" className="inline-flex rounded-2xl border border-slate-700 bg-slate-900 px-5 py-3 text-sm font-semibold text-slate-200 transition hover:bg-slate-800">
            Change track
          </a>
        </div>
      </div>
    </div>
  )
}
