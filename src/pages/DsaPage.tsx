import { useCallback, useEffect, useMemo, useRef, useState, type MouseEvent } from 'react'
import atlas from '../data/dsaAtlas.json'
import { AtlasShell } from '../components/atlas/AtlasShell'
import { escapeHtml, highlight } from '../components/atlas/highlight'
import { useAtlasViz, type AtlasViz } from '../components/atlas/useAtlasViz'

type Solution = { label: string; time: string; space: string; steps: string[]; code: string; intuition?: string; remember?: string }
type Problem = {
  id: number
  lc: number
  slug: string
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
const REVISED_KEY = 'ib-dsa-revised'
const filters = [
  { key: 'all', label: `All ${problems.length}` },
  { key: 'Easy', label: 'Easy' },
  { key: 'Medium', label: 'Medium' },
  { key: 'Hard', label: 'Hard' },
  { key: 'todo', label: 'Not revised' },
] as const
type FilterKey = (typeof filters)[number]['key']

const rank = (label: string) => (/^naive/i.test(label) ? 'slow' : /^optimised/i.test(label) ? 'mid' : /^best/i.test(label) ? 'fast' : 'neutral')
/** Which solution the atlas's default frames belong to (Best if there is one, else the last). */
const defaultSolution = (p: Problem) => {
  const best = p.solutions.findIndex((s) => rank(s.label) === 'fast')
  return best >= 0 ? best : p.solutions.length - 1
}
const storyHtml = (story: string) => escapeHtml(story).replace(/(&quot;[^&]+?&quot;)/, '<mark>$1</mark>')

const readRevised = (): Set<number> => {
  try {
    return new Set(JSON.parse(localStorage.getItem(REVISED_KEY) || '[]') as number[])
  } catch {
    return new Set()
  }
}

function Viz({ viz, problem, si }: { viz: AtlasViz | null; problem: Problem; si: number }) {
  const def = defaultSolution(problem)
  const [frame, setFrame] = useState(0)
  const [playing, setPlaying] = useState(false)
  const timer = useRef<number | null>(null)
  const count = viz?.allFrames(problem.id, si, def)?.length ?? 0

  const stop = useCallback(() => {
    if (timer.current !== null) window.clearInterval(timer.current)
    timer.current = null
    setPlaying(false)
  }, [])
  useEffect(() => stop, [stop])

  const onClick = (event: MouseEvent<HTMLElement>) => {
    const target = event.target as HTMLElement
    if (target.closest('.vz-play')) {
      if (playing) return stop()
      const start = frame >= count - 1 ? 0 : frame
      setFrame(start)
      setPlaying(true)
      let k = start
      timer.current = window.setInterval(() => {
        k += 1
        setFrame(Math.min(k, count - 1))
        if (k >= count - 1) stop()
      }, 1700)
      return
    }
    const btn = target.closest<HTMLButtonElement>('.vz-btn')
    if (btn?.dataset.to) {
      stop()
      setFrame(Number(btn.dataset.to))
    }
  }

  if (!viz) return <figure className="viz loading">Loading the illustration…</figure>
  return <figure className="viz" onClick={onClick} dangerouslySetInnerHTML={{ __html: viz.render(problem.id, si, frame, def, playing) }} />
}

function ProblemCard({ problem, viz, revised, onRevised }: { problem: Problem; viz: AtlasViz | null; revised: boolean; onRevised: () => void }) {
  const [si, setSi] = useState(0)
  const [copied, setCopied] = useState(false)
  const sol = problem.solutions[si]

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(sol.code)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1500)
    } catch {
      setCopied(false)
    }
  }

  return (
    <article className={`card${revised ? ' revised' : ''}`} id={`q-${problem.id}`}>
      <div className="card-head">
        <span className="qno">#{problem.id}</span>
        <h3>
          <a href={`#q-${problem.id}`}>{problem.title}</a>
        </h3>
        <a className="lc" href={`https://leetcode.com/problems/${problem.slug}/`} target="_blank" rel="noreferrer" title={`Open ${problem.title} on LeetCode`}>
          LC {problem.lc} ↗
        </a>
        <span className={`pill ${problem.difficulty}`}>{problem.difficulty}</span>
      </div>
      <p className="desc">
        {problem.statement}
        <span className="ex">
          <b>e.g.</b>
          {problem.example}
        </span>
      </p>
      <p className="hook">
        <span className="story">story:</span>
        <span dangerouslySetInnerHTML={{ __html: storyHtml(problem.story) }} />
      </p>

      {/* key={si}: a new solution tab starts its own walk-through from frame 1 */}
      <Viz key={si} viz={viz} problem={problem} si={si} />

      <div className="ladder" role="group" aria-label="Solutions">
        {problem.solutions.map((s, index) => (
          <span key={s.label} style={{ display: 'contents' }}>
            {index > 0 ? (
              <span className="chev" aria-hidden="true">
                ›
              </span>
            ) : null}
            <button type="button" className={`rung ${rank(s.label)}`} aria-pressed={si === index} onClick={() => setSi(index)}>
              <span className="lab">{s.label}</span>
              <span className="t">{s.time}</span>
            </button>
          </span>
        ))}
      </div>

      <div className="panel">
        {sol.intuition ? (
          <div className="intu">
            <span className="intu-tag">Intuition</span>
            <p>{sol.intuition}</p>
            {sol.remember ? (
              <p className="remember">
                <b>Remember:</b> {sol.remember}
              </p>
            ) : null}
          </div>
        ) : null}
        <ol>
          {sol.steps.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
        <div className="codebox">
          <div className="codebar">
            <span>
              Time <b>{sol.time}</b> · Space <b>{sol.space}</b>
            </span>
            <button type="button" className="copy" onClick={copy}>
              {copied ? 'Copied' : 'Copy C++'}
            </button>
          </div>
          <pre>
            <code dangerouslySetInnerHTML={{ __html: highlight(sol.code, 'cpp') }} />
          </pre>
        </div>
      </div>

      <div className="card-foot">
        <a className="foot-link" href={`${ATLAS_URL}/#q-${problem.id}`} target="_blank" rel="noreferrer">
          Open in DSA Atlas ↗
        </a>
        <a className="foot-link" href={`https://leetcode.com/problems/${problem.slug}/`} target="_blank" rel="noreferrer">
          Solve on LeetCode ↗
        </a>
        <button type="button" className="rev" aria-pressed={revised} onClick={onRevised}>
          {revised ? 'Revised ✓' : 'Mark as revised'}
        </button>
      </div>
    </article>
  )
}

export default function DsaPage() {
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<FilterKey>('all')
  const [revised, setRevised] = useState<Set<number>>(readRevised)
  const { viz } = useAtlasViz((v) => v.setData(problems.map((p) => ({ id: p.id, title: p.title, sols: p.solutions }))))

  const toggleRevised = (id: number) =>
    setRevised((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      try {
        localStorage.setItem(REVISED_KEY, JSON.stringify([...next]))
      } catch {
        /* storage unavailable */
      }
      return next
    })

  const groups = useMemo(() => {
    const needle = query.trim().toLowerCase()
    const matches = (p: Problem) =>
      (filter === 'all' || (filter === 'todo' ? !revised.has(p.id) : p.difficulty === filter)) &&
      (!needle ||
        p.title.toLowerCase().includes(needle) ||
        String(p.lc) === needle ||
        String(p.id) === needle ||
        p.statement.toLowerCase().includes(needle) ||
        p.pattern.toLowerCase().includes(needle) ||
        p.story.toLowerCase().includes(needle))
    return patterns.map((pattern) => ({ pattern, items: problems.filter((p) => p.pattern === pattern.key && matches(p)) })).filter((g) => g.items.length)
  }, [query, filter, revised])

  // Shared links like /dsa#q-71 jump to that card once it is on the page.
  useEffect(() => {
    const id = window.location.hash.slice(1)
    if (id) window.requestAnimationFrame(() => document.getElementById(id)?.scrollIntoView({ block: 'start' }))
  }, [])

  const tools = (
    <>
      <div className="row">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search a problem, LC number or idea (e.g. 739, heap, window)"
          aria-label="Search problems"
        />
        <span className="progress">
          {revised.size} / {problems.length} revised
        </span>
      </div>
      <div className="row scroll" role="group" aria-label="Filter">
        {filters.map((f) => (
          <button key={f.key} type="button" className="chip" aria-pressed={filter === f.key} onClick={() => setFilter(f.key)}>
            {f.label}
          </button>
        ))}
      </div>
    </>
  )

  return (
    <AtlasShell
      title={
        <>
          DSA Memory Atlas <span className="scribble">80 problems</span>
        </>
      }
      lede="15 patterns, each problem climbing from Naive to Best. Press Play on any picture to watch the solution run on its example, step by step."
      sideTitle="Patterns"
      items={groups.map((g) => ({ key: g.pattern.key, name: g.pattern.name, count: g.items.length }))}
      tools={tools}
    >
      {groups.length ? (
        groups.map(({ pattern, items }) => (
          <section key={pattern.key} id={`sec-${pattern.key}`} data-sec={pattern.key} className="section">
            <div className="pat-head">
              <span className="pat-no">{String(patterns.indexOf(pattern) + 1).padStart(2, '0')}</span>
              <h2>{pattern.name}</h2>
              <span className="count">
                {items.length} problem{items.length > 1 ? 's' : ''}
              </span>
            </div>
            <p className="mantra">{pattern.mantra}</p>
            <div className="cards">
              {items.map((problem) => (
                <ProblemCard key={problem.id} problem={problem} viz={viz} revised={revised.has(problem.id)} onRevised={() => toggleRevised(problem.id)} />
              ))}
            </div>
          </section>
        ))
      ) : (
        <p className="empty">No problems match these filters.</p>
      )}
    </AtlasShell>
  )
}
