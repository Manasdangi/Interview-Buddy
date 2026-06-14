import { useMemo, useState } from 'react'
import { CheckCircle2 } from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'
import { Button } from '../components/ui/Button'
import { useInterviewStore } from '../store/interviewStore'
import type { Difficulty, InterviewType } from '../types/interview'
import { cn } from '../utils/cn'

const difficulties: Array<{ label: string; value: Difficulty; description: string; detail: string }> = [
  {
    label: 'Beginner',
    value: 'BEGINNER',
    description: 'Simple concepts and easy walkthroughs.',
    detail: 'Best for warming up fundamentals.',
  },
  {
    label: 'Intermediate',
    value: 'INTERMEDIATE',
    description: 'Balanced challenges with deeper follow-ups.',
    detail: 'Best for realistic interview practice.',
  },
  {
    label: 'Advanced',
    value: 'ADVANCED',
    description: 'Harder scenarios and architecture-level nuance.',
    detail: 'Best for senior-level depth.',
  },
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

      <div className="grid gap-4 md:grid-cols-3" role="radiogroup" aria-label="Difficulty level">
        {difficulties.map((item) => (
          <button
            key={item.value}
            type="button"
            role="radio"
            aria-checked={selected === item.value}
            className={cn(
              'group flex min-h-[172px] w-full flex-col justify-between rounded-3xl border p-6 text-left shadow-soft transition duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950',
              selected === item.value
                ? 'border-indigo-300 bg-indigo-950/45 shadow-indigo-950/30'
                : 'border-slate-800/80 bg-slate-950/90 hover:border-slate-600 hover:bg-slate-900/80',
            )}
            onClick={() => setSelected(item.value)}
          >
            <span className="flex items-start justify-between gap-4">
              <span>
                <span className="block text-2xl font-semibold text-white">{item.label}</span>
                <span className="mt-3 block text-base leading-7 text-slate-300">{item.description}</span>
              </span>
              <span
                className={cn(
                  'grid h-8 w-8 shrink-0 place-items-center rounded-full border transition',
                  selected === item.value ? 'border-indigo-300 bg-primary text-white' : 'border-slate-700 text-slate-600 group-hover:text-slate-300',
                )}
                aria-hidden="true"
              >
                <CheckCircle2 className="h-5 w-5" />
              </span>
            </span>
            <span className={cn('mt-5 block text-sm font-medium', selected === item.value ? 'text-indigo-100' : 'text-slate-500')}>
              {selected === item.value ? 'Selected' : item.detail}
            </span>
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-4 rounded-3xl border border-slate-800/80 bg-slate-950/80 p-4 sm:flex-row sm:items-center sm:justify-between">
        {error ? <p className="text-sm text-rose-300">{error}</p> : null}
        <p className="text-sm text-slate-400">
          Selected difficulty: <span className="font-semibold text-white">{difficulties.find((item) => item.value === selected)?.label}</span>
        </p>
        <div className="flex flex-wrap items-center gap-3">
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
