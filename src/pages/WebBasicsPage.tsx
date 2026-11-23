import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { Check, ChevronDown, Copy, Link2, Search } from 'lucide-react'
import { Input } from '../components/ui/Input'
import { WebDiagram } from '../components/web/WebDiagram'
import { webGroups, webQuestions, webTopics, type WebQuestion, type WebTopic } from '../data/webQuestions'
import { cn } from '../utils/cn'

const levelStyle: Record<WebQuestion['level'], string> = {
  Basic: 'bg-emerald-500/10 text-emerald-300',
  Core: 'bg-amber-500/10 text-amber-300',
  Advanced: 'bg-rose-500/10 text-rose-300',
}

const isTopic = (value: string | null): value is WebTopic => webTopics.some((topic) => topic.key === value)

function CopyButton({ text, label, done, icon: Icon }: { text: string; label: string; done: string; icon: typeof Copy }) {
  const [copied, setCopied] = useState(false)
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1500)
    } catch {
      setCopied(false)
    }
  }
  return (
    <button
      type="button"
      onClick={copy}
      className="inline-flex items-center gap-1.5 rounded-full border border-slate-700 px-3 py-1 text-xs font-medium text-slate-300 transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
    >
      {copied ? <Check className="h-3.5 w-3.5" aria-hidden="true" /> : <Icon className="h-3.5 w-3.5" aria-hidden="true" />}
      {copied ? done : label}
    </button>
  )
}

function QuestionRow({ question, index, open, onToggle }: { question: WebQuestion; index: number; open: boolean; onToggle: () => void }) {
  const panelId = `web-${question.id}-panel`
  const shareUrl = `${window.location.origin}/web?topic=${question.topic}#${question.id}`

  return (
    <li id={question.id} className="scroll-mt-28 rounded-3xl border border-slate-800/80 bg-slate-950/90 shadow-soft">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        aria-controls={panelId}
        className="flex w-full items-center gap-4 rounded-3xl px-5 py-4 text-left transition hover:bg-slate-900/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      >
        <span className="w-7 shrink-0 font-mono text-xs text-slate-500">{String(index + 1).padStart(2, '0')}</span>
        <span className="min-w-0 flex-1 font-medium text-white">{question.title}</span>
        <span className={cn('rounded-full px-2.5 py-1 text-xs font-semibold', levelStyle[question.level])}>{question.level}</span>
        <ChevronDown className={cn('h-4 w-4 shrink-0 text-slate-500 transition', open && 'rotate-180')} aria-hidden="true" />
      </button>

      {open ? (
        <div id={panelId} className="space-y-5 border-t border-slate-800/80 px-5 py-5">
          <WebDiagram diagram={question.diagram} />

          <p className="text-sm leading-7 text-slate-300">{question.answer}</p>

          {question.points?.length ? (
            <ul className="list-disc space-y-1 pl-5 text-sm text-slate-300">
              {question.points.map((point) => (
                <li key={point}>{point}</li>
              ))}
            </ul>
          ) : null}

          <p className="rounded-2xl border border-indigo-400/30 bg-indigo-950/40 px-4 py-3 text-sm text-slate-200">
            <span className="font-semibold text-indigo-300">Remember:</span> {question.remember}
          </p>

          {question.code ? (
            <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/70">
              <div className="flex items-center justify-between gap-3 border-b border-slate-800 px-4 py-2 text-xs text-slate-400">
                <span className="font-mono uppercase">{question.topic === 'js' ? 'javascript' : question.topic}</span>
                <CopyButton text={question.code} label="Copy" done="Copied" icon={Copy} />
              </div>
              <pre className="max-h-[24rem] overflow-auto p-4 text-[13px] leading-6 text-slate-200">
                <code>{question.code}</code>
              </pre>
            </div>
          ) : null}

          <div className="flex justify-end">
            <CopyButton text={shareUrl} label="Copy link" done="Link copied" icon={Link2} />
          </div>
        </div>
      ) : null}
    </li>
  )
}

export default function WebBasicsPage() {
  const [params] = useSearchParams()
  const location = useLocation()
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [group, setGroup] = useState('All')
  const [openIds, setOpenIds] = useState<Set<string>>(() => new Set())

  const hashId = location.hash.slice(1)
  const linked = webQuestions.find((question) => question.id === hashId)
  const topic: WebTopic = linked?.topic ?? (isTopic(params.get('topic')) ? (params.get('topic') as WebTopic) : 'html')
  const current = webTopics.find((item) => item.key === topic) ?? webTopics[0]

  // A shared link (#question-id) starts with that question open and scrolls to it.
  // openIds stores the rows the user flipped, so the linked row can still be closed.
  const isOpen = (id: string) => openIds.has(id) !== (id === hashId)
  useEffect(() => {
    if (!linked) return
    window.requestAnimationFrame(() => document.getElementById(linked.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' }))
  }, [linked])

  const groupNames = webGroups[topic].map((item) => item.name)
  const activeGroup = groupNames.includes(group) ? group : 'All'

  const list = useMemo(() => {
    const needle = query.trim().toLowerCase()
    return webQuestions.filter(
      (question) =>
        question.topic === topic &&
        (activeGroup === 'All' || question.group === activeGroup) &&
        (!needle || question.title.toLowerCase().includes(needle) || question.answer.toLowerCase().includes(needle) || question.remember.toLowerCase().includes(needle)),
    )
  }, [topic, query, activeGroup])

  const sections = useMemo(() => {
    const out: { name: string; items: { question: WebQuestion; index: number }[] }[] = []
    list.forEach((question, index) => {
      const name = question.group ?? 'Questions'
      const last = out[out.length - 1]
      if (last && last.name === name) last.items.push({ question, index })
      else out.push({ name, items: [{ question, index }] })
    })
    return out
  }, [list])

  const switchTopic = (next: WebTopic) => {
    setQuery('')
    setGroup('All')
    navigate({ search: `?topic=${next}`, hash: '' }, { replace: true })
  }

  const toggle = (id: string) =>
    setOpenIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })

  return (
    <div className="space-y-8">
      <div className="rounded-[2rem] border border-slate-800/80 bg-slate-950/90 p-8 shadow-soft">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-indigo-300">Frontend fundamentals</p>
        <h1 className="mt-4 text-4xl font-semibold text-white">HTML, CSS & JavaScript</h1>
        <p className="mt-3 max-w-2xl text-slate-400">
          The questions that come up in almost every frontend round. Each one has a picture of the idea, a short answer you can say out loud, a one-line
          memory hook and a small code example.
        </p>

        <div className="mt-6 flex flex-col gap-4 lg:flex-row lg:items-center">
          <div className="flex gap-2" role="tablist" aria-label="Topic">
            {webTopics.map((item) => {
              const count = webQuestions.filter((question) => question.topic === item.key).length
              return (
                <button
                  key={item.key}
                  type="button"
                  role="tab"
                  aria-selected={topic === item.key}
                  onClick={() => switchTopic(item.key)}
                  className={cn(
                    'whitespace-nowrap rounded-full border px-4 py-2 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
                    topic === item.key ? 'border-indigo-300 bg-indigo-950/60 text-white' : 'border-slate-700 text-slate-400 hover:border-slate-500 hover:text-slate-200',
                  )}
                >
                  {item.name} <span className="ml-1 text-xs text-slate-500">{count}</span>
                </button>
              )
            })}
          </div>
          <label className="relative block lg:ml-auto lg:w-80">
            <span className="sr-only">Search {current.name} questions</span>
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" aria-hidden="true" />
            <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={`Search ${current.name} questions…`} className="pl-10" />
          </label>
        </div>

        <div className="mt-4 flex flex-wrap gap-2" role="radiogroup" aria-label={`${current.name} sub-topic`}>
          {['All', ...groupNames].map((name) => (
            <button
              key={name}
              type="button"
              role="radio"
              aria-checked={activeGroup === name}
              onClick={() => setGroup(name)}
              className={cn(
                'rounded-full border px-3 py-1.5 text-xs transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
                activeGroup === name ? 'border-indigo-300 bg-indigo-950/60 text-white' : 'border-slate-800 text-slate-400 hover:border-slate-600 hover:text-slate-200',
              )}
            >
              {name === 'All' ? `All ${current.name}` : name}
            </button>
          ))}
        </div>
      </div>

      <section aria-labelledby="web-topic-heading" className="space-y-3">
        <div>
          <h2 id="web-topic-heading" className="text-xl font-semibold text-white">
            {current.name} <span className="text-sm font-normal text-slate-500">· {list.length}</span>
          </h2>
          <p className="text-sm text-slate-400">{current.tagline}</p>
        </div>
        {list.length ? (
          <div className="space-y-8">
            {sections.map((section) => (
              <div key={section.name} className="space-y-3">
                <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                  {section.name} <span className="font-normal normal-case tracking-normal">· {section.items.length}</span>
                </h3>
                <ul className="space-y-3">
                  {section.items.map(({ question, index }) => (
                    <QuestionRow key={question.id} question={question} index={index} open={isOpen(question.id)} onToggle={() => toggle(question.id)} />
                  ))}
                </ul>
              </div>
            ))}
          </div>
        ) : (
          <p className="rounded-3xl border border-slate-800/80 bg-slate-950/90 p-8 text-center text-slate-400">No questions match these filters.</p>
        )}
      </section>
    </div>
  )
}
