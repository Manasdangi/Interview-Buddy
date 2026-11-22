import { useMemo, useState } from 'react'
import { Check, ChevronDown, Copy, ExternalLink, Search } from 'lucide-react'
import atlas from '../data/dsaAtlas.json'
import { Input } from '../components/ui/Input'
import { cn } from '../utils/cn'

type Solution = {
  label: string
  time: string
  space: string
  steps: string[]
  code: string
  intuition?: string
  remember?: string
}

type Problem = {
  id: number
  lc: number
  title: string
  difficulty: 'Easy' | 'Medium' | 'Hard'
  pattern: string
  story: string
  statement: string
  example: string
  solutions: Solution[]
}

type Pattern = { key: string; name: string; mantra: string }

const { patterns, problems } = atlas as { patterns: Pattern[]; problems: Problem[] }

const ATLAS_URL = 'https://dsa-memory-atlas.vercel.app'
const difficulties = ['All', 'Easy', 'Medium', 'Hard'] as const
type DifficultyFilter = (typeof difficulties)[number]

const difficultyStyle: Record<Problem['difficulty'], string> = {
  Easy: 'bg-emerald-500/10 text-emerald-300',
  Medium: 'bg-amber-500/10 text-amber-300',
  Hard: 'bg-rose-500/10 text-rose-300',
}

const ladderStyle = ['border-t-rose-400', 'border-t-amber-400', 'border-t-emerald-400']

function SolutionView({ solution }: { solution: Solution }) {
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(solution.code)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1500)
    } catch {
      setCopied(false)
    }
  }

  return (
    <div className="space-y-4">
      {solution.intuition ? (
        <div className="rounded-2xl border border-indigo-400/30 bg-indigo-950/40 p-4 text-sm leading-6 text-slate-300">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-indigo-300">Intuition</p>
          <p className="mt-1">{solution.intuition}</p>
          {solution.remember ? (
            <p className="mt-2 text-slate-200">
              <span className="font-semibold text-indigo-300">Remember:</span> {solution.remember}
            </p>
          ) : null}
        </div>
      ) : null}

      <ol className="list-decimal space-y-1 pl-5 text-sm text-slate-300">
        {solution.steps.map((step) => (
          <li key={step}>{step}</li>
        ))}
      </ol>

      <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/70">
        <div className="flex items-center justify-between gap-3 border-b border-slate-800 px-4 py-2 text-xs text-slate-400">
          <span className="font-mono">
            Time <span className="text-slate-200">{solution.time}</span> · Space <span className="text-slate-200">{solution.space}</span>
          </span>
          <button
            type="button"
            onClick={copy}
            className="inline-flex items-center gap-1.5 rounded-full border border-slate-700 px-3 py-1 text-xs font-medium text-slate-300 transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            {copied ? <Check className="h-3.5 w-3.5" aria-hidden="true" /> : <Copy className="h-3.5 w-3.5" aria-hidden="true" />}
            {copied ? 'Copied' : 'Copy C++'}
          </button>
        </div>
        <pre className="max-h-[28rem] overflow-auto p-4 text-[13px] leading-6 text-slate-200">
          <code>{solution.code}</code>
        </pre>
      </div>
    </div>
  )
}

function ProblemRow({ problem }: { problem: Problem }) {
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(0)
  const panelId = `dsa-problem-${problem.id}`

  return (
    <li className="rounded-3xl border border-slate-800/80 bg-slate-950/90 shadow-soft">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-controls={panelId}
        className="flex w-full items-center gap-4 rounded-3xl px-5 py-4 text-left transition hover:bg-slate-900/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      >
        <span className="w-8 shrink-0 font-mono text-xs text-slate-500">#{problem.id}</span>
        <span className="min-w-0 flex-1">
          <span className="block font-medium text-white">{problem.title}</span>
          <span className="block truncate text-sm text-slate-400">{problem.statement}</span>
        </span>
        <span className="hidden font-mono text-xs text-slate-500 sm:inline">LC {problem.lc}</span>
        <span className={cn('rounded-full px-2.5 py-1 text-xs font-semibold', difficultyStyle[problem.difficulty])}>{problem.difficulty}</span>
        <ChevronDown className={cn('h-4 w-4 shrink-0 text-slate-500 transition', open && 'rotate-180')} aria-hidden="true" />
      </button>

      {open ? (
        <div id={panelId} className="space-y-5 border-t border-slate-800/80 px-5 py-5">
          <div className="space-y-2 text-sm leading-6">
            <p className="text-slate-300">{problem.statement}</p>
            <p className="font-mono text-xs text-slate-400">e.g. {problem.example}</p>
            <p className="text-slate-300">
              <span className="font-semibold text-indigo-300">Story:</span> {problem.story}
            </p>
          </div>

          <div className="grid gap-2 sm:grid-cols-3" role="tablist" aria-label={`${problem.title} solutions`}>
            {problem.solutions.map((solution, index) => (
              <button
                key={solution.label}
                type="button"
                role="tab"
                aria-selected={active === index}
                onClick={() => setActive(index)}
                className={cn(
                  'rounded-2xl border border-t-4 px-4 py-3 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
                  ladderStyle[Math.min(index, 2)],
                  active === index ? 'border-x-indigo-400 border-b-indigo-400 bg-indigo-950/40' : 'border-x-slate-800 border-b-slate-800 hover:bg-slate-900/60',
                )}
              >
                <span className="block text-sm font-semibold text-white">{solution.label}</span>
                <span className="block font-mono text-xs text-slate-400">{solution.time}</span>
              </button>
            ))}
          </div>

          <SolutionView solution={problem.solutions[active]} />

          <div className="flex flex-wrap gap-3 text-sm">
            <a
              href={`${ATLAS_URL}/#q-${problem.id}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 font-medium text-indigo-300 hover:text-indigo-200"
            >
              Step-by-step dry run <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
            </a>
            <a
              href={`https://leetcode.com/problemset/?search=${encodeURIComponent(problem.title)}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-slate-400 hover:text-slate-200"
            >
              Solve on LeetCode <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
            </a>
          </div>
        </div>
      ) : null}
    </li>
  )
}

export default function DsaPage() {
  const [query, setQuery] = useState('')
  const [difficulty, setDifficulty] = useState<DifficultyFilter>('All')
  const [pattern, setPattern] = useState<string>('ALL')

  const groups = useMemo(() => {
    const needle = query.trim().toLowerCase()
    const matches = (problem: Problem) =>
      (difficulty === 'All' || problem.difficulty === difficulty) &&
      (pattern === 'ALL' || problem.pattern === pattern) &&
      (!needle ||
        problem.title.toLowerCase().includes(needle) ||
        String(problem.lc) === needle ||
        String(problem.id) === needle ||
        problem.statement.toLowerCase().includes(needle))

    return patterns
      .map((item) => ({ pattern: item, items: problems.filter((problem) => problem.pattern === item.key && matches(problem)) }))
      .filter((group) => group.items.length)
  }, [query, difficulty, pattern])

  const shown = groups.reduce((total, group) => total + group.items.length, 0)

  return (
    <div className="space-y-8">
      <div className="rounded-[2rem] border border-slate-800/80 bg-slate-950/90 p-8 shadow-soft">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-indigo-300">DSA round prep</p>
        <h1 className="mt-4 text-4xl font-semibold text-white">80 problems, 15 patterns</h1>
        <p className="mt-3 max-w-2xl text-slate-400">
          Every problem climbs a ladder from Naive to Best, with the intuition to remember it and commented C++. Open the dry run to watch each
          solution step through its example.
        </p>

        <div className="mt-6 flex flex-col gap-4 lg:flex-row lg:items-center">
          <label className="relative block lg:w-80">
            <span className="sr-only">Search problems</span>
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" aria-hidden="true" />
            <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search a problem or LC number…" className="pl-10" />
          </label>
          <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Difficulty">
            {difficulties.map((item) => (
              <button
                key={item}
                type="button"
                role="radio"
                aria-checked={difficulty === item}
                onClick={() => setDifficulty(item)}
                className={cn(
                  'rounded-full border px-4 py-2 text-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
                  difficulty === item ? 'border-indigo-300 bg-indigo-950/60 text-white' : 'border-slate-700 text-slate-400 hover:border-slate-500 hover:text-slate-200',
                )}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2" role="radiogroup" aria-label="Pattern">
          {[{ key: 'ALL', name: 'All patterns' }, ...patterns].map((item) => (
            <button
              key={item.key}
              type="button"
              role="radio"
              aria-checked={pattern === item.key}
              onClick={() => setPattern(item.key)}
              className={cn(
                'rounded-full border px-3 py-1.5 text-xs transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
                pattern === item.key ? 'border-indigo-300 bg-indigo-950/60 text-white' : 'border-slate-800 text-slate-400 hover:border-slate-600 hover:text-slate-200',
              )}
            >
              {item.name}
            </button>
          ))}
        </div>
      </div>

      {shown ? (
        <div className="space-y-10">
          {groups.map(({ pattern: item, items }) => (
            <section key={item.key} aria-labelledby={`pattern-${item.key}`} className="space-y-3">
              <div>
                <h2 id={`pattern-${item.key}`} className="text-xl font-semibold text-white">
                  {item.name} <span className="text-sm font-normal text-slate-500">· {items.length}</span>
                </h2>
                <p className="text-sm text-slate-400">{item.mantra}</p>
              </div>
              <ul className="space-y-3">
                {items.map((problem) => (
                  <ProblemRow key={problem.id} problem={problem} />
                ))}
              </ul>
            </section>
          ))}
        </div>
      ) : (
        <p className="rounded-3xl border border-slate-800/80 bg-slate-950/90 p-8 text-center text-slate-400">No problems match these filters.</p>
      )}
    </div>
  )
}
