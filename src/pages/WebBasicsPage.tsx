import { useCallback, useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { AtlasShell } from '../components/atlas/AtlasShell'
import { highlight } from '../components/atlas/highlight'
import { WebDiagram } from '../components/web/WebDiagram'
import { WebDemo } from '../components/web/WebDemo'
import { WebCases } from '../components/web/WebCases'
import { webGroups, webQuestions, webTopics, type WebQuestion, type WebTopic } from '../data/webQuestions'

const levels = ['All levels', 'Basic', 'Core', 'Advanced'] as const
type LevelFilter = (typeof levels)[number]

const isTopic = (value: string | null): value is WebTopic => webTopics.some((topic) => topic.key === value)
const slug = (name: string) => name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
const codeLang = (topic: WebTopic) => (topic === 'js' ? 'js' : 'plain')
/** Topics whose illustrations play as animations (rolled out topic by topic). */
const ANIMATED_TOPICS = new Set<WebTopic>(['js', 'css'])

const REVISED_KEY = 'ib-web-revised'
type StatusFilter = 'All' | 'To revise' | 'Revised'
const statuses: StatusFilter[] = ['All', 'To revise', 'Revised']

function useRevised() {
  const [revised, setRevised] = useState<Set<string>>(() => {
    try {
      return new Set<string>(JSON.parse(window.localStorage.getItem(REVISED_KEY) ?? '[]'))
    } catch {
      return new Set<string>()
    }
  })
  const toggle = useCallback((id: string) => {
    setRevised((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      try {
        window.localStorage.setItem(REVISED_KEY, JSON.stringify([...next]))
      } catch {
        /* storage unavailable — keep it in memory for this visit */
      }
      return next
    })
  }, [])
  return { revised, toggle }
}

const haystack = (q: WebQuestion) =>
  [q.title, q.answer, q.remember, q.group, q.id.replace(/-/g, ' '), ...(q.points ?? []), q.code ?? '', ...(q.cases ?? []).flat()].join(' \n ').toLowerCase()
const haystacks = new Map<string, string>(webQuestions.map((q) => [q.id, haystack(q)]))

function QuestionCard({ question, no, revised, onToggle }: { question: WebQuestion; no: number; revised: boolean; onToggle: () => void }) {
  const [copied, setCopied] = useState<'code' | 'link' | null>(null)
  const copy = async (what: 'code' | 'link') => {
    const text = what === 'code' ? (question.code ?? '') : `${window.location.origin}/web?topic=${question.topic}#${question.id}`
    try {
      await navigator.clipboard.writeText(text)
      setCopied(what)
      window.setTimeout(() => setCopied(null), 1500)
    } catch {
      setCopied(null)
    }
  }

  return (
    <article className={`card${revised ? ' revised' : ''}`} id={question.id}>
      <div className="card-head">
        <span className="qno">#{no}</span>
        <h3>
          <a href={`#${question.id}`}>{question.title}</a>
        </h3>
        <span className={`pill ${question.level}`}>{question.level}</span>
        <button type="button" className="rev-btn" aria-pressed={revised} onClick={onToggle} title={revised ? 'Marked as revised — click to undo' : 'Mark this question as revised'}>
          <span className="rev-box" aria-hidden="true">{revised ? '✓' : ''}</span>
          {revised ? 'Revised' : 'Mark revised'}
        </button>
      </div>

      <p className="answer">{question.answer}</p>
      {question.points?.length ? (
        <ul className="points">
          {question.points.map((point) => (
            <li key={point}>{point}</li>
          ))}
        </ul>
      ) : null}

      <div className="intu">
        <p className="remember">
          <b>Remember:</b> {question.remember}
        </p>
      </div>

      {question.demo ? <WebDemo demo={question.demo} title={question.title} /> : null}
      <WebDiagram diagram={question.diagram} animated={ANIMATED_TOPICS.has(question.topic)} />

      {question.code ? (
        <div className="codebox">
          <div className="codebar">
            <span>{question.topic === 'js' ? 'JavaScript' : question.topic.toUpperCase()}</span>
            <button type="button" className="copy" onClick={() => copy('code')}>
              {copied === 'code' ? 'Copied' : 'Copy'}
            </button>
          </div>
          <pre>
            <code dangerouslySetInnerHTML={{ __html: highlight(question.code, codeLang(question.topic)) }} />
          </pre>
        </div>
      ) : null}

      {question.cases?.length ? <WebCases cases={question.cases} lang={codeLang(question.topic)} /> : null}

      <div className="card-foot">
        <button type="button" className="foot-link" onClick={() => copy('link')}>
          {copied === 'link' ? 'Link copied ✓' : 'Copy link to this question'}
        </button>
      </div>
    </article>
  )
}

export default function WebBasicsPage() {
  const [params] = useSearchParams()
  const location = useLocation()
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [level, setLevel] = useState<LevelFilter>('All levels')
  const [status, setStatus] = useState<StatusFilter>('All')
  const { revised, toggle } = useRevised()

  const hashId = location.hash.slice(1)
  const linked = webQuestions.find((question) => question.id === hashId)
  const topic: WebTopic = linked?.topic ?? (isTopic(params.get('topic')) ? (params.get('topic') as WebTopic) : 'html')
  const current = webTopics.find((item) => item.key === topic) ?? webTopics[0]
  const searching = query.trim().length > 0

  // A shared link (#question-id) scrolls to that question.
  useEffect(() => {
    if (!linked) return
    window.requestAnimationFrame(() => document.getElementById(linked.id)?.scrollIntoView({ block: 'start' }))
  }, [linked])

  // The address bar follows the question you are reading, so a copied URL always points at it.
  useEffect(() => {
    let frame = 0
    const update = () => {
      frame = 0
      const header = document.querySelector('header')?.getBoundingClientRect().height ?? 73
      const tools = document.querySelector('.atlas .tools')?.getBoundingClientRect().height ?? 104
      const line = header + tools + 70
      let id: string | null = null
      document.querySelectorAll<HTMLElement>('.atlas article.card[id]').forEach((card) => {
        if (card.getBoundingClientRect().top <= line) id = card.id
      })
      const question = webQuestions.find((q) => q.id === id)
      const url = question ? `/web?topic=${question.topic}#${question.id}` : `/web?topic=${topic}`
      if (window.location.pathname + window.location.search + window.location.hash !== url) window.history.replaceState(window.history.state, '', url)
    }
    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(update)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      if (frame) window.cancelAnimationFrame(frame)
    }
  }, [topic])

  // Searching looks across HTML, CSS and JavaScript; otherwise the page shows the selected topic.
  const sections = useMemo(() => {
    const words = query.trim().toLowerCase().split(/\s+/).filter(Boolean)
    const scope = words.length ? webTopics.map((t) => t.key) : [topic]
    return scope
      .flatMap((t) =>
        webGroups[t].map((group, groupIndex) => ({
          topic: t,
          group,
          groupIndex,
          items: webQuestions
            .filter((q) => q.topic === t)
            .map((question, index) => ({ question, no: index + 1 }))
            .filter(
              ({ question }) =>
                question.group === group.name &&
                (level === 'All levels' || question.level === level) &&
                (status === 'All' || (status === 'Revised') === revised.has(question.id)) &&
                words.every((w) => haystacks.get(question.id)?.includes(w)),
            ),
        })),
      )
      .filter((section) => section.items.length)
  }, [topic, query, level, status, revised])

  const shown = sections.reduce((total, section) => total + section.items.length, 0)
  const scopeTotal = searching ? webQuestions.length : webQuestions.filter((q) => q.topic === topic).length
  const topicName = (t: WebTopic) => webTopics.find((item) => item.key === t)?.name ?? t

  const switchTopic = (next: WebTopic) => {
    setQuery('')
    navigate({ search: `?topic=${next}`, hash: '' }, { replace: true })
    window.scrollTo({ top: 0 })
  }

  const tools = (
    <>
      <div className="row">
        <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search all HTML, CSS & JS questions (e.g. stacking context, closure, flex)" aria-label="Search questions" />
        <span className="progress">
          {shown} / {scopeTotal} shown · ✓ {revised.size} revised
        </span>
      </div>
      <div className="row scroll" role="group" aria-label="Topic and level">
        {webTopics.map((item) => (
          <button key={item.key} type="button" className="chip" aria-pressed={topic === item.key} onClick={() => switchTopic(item.key)}>
            {item.name}
            <span className="n">{webQuestions.filter((q) => q.topic === item.key).length}</span>
          </button>
        ))}
        <span className="chev" aria-hidden="true">
          ·
        </span>
        {levels.map((item) => (
          <button key={item} type="button" className="chip" aria-pressed={level === item} onClick={() => setLevel(item)}>
            {item}
          </button>
        ))}
        <span className="chev" aria-hidden="true">
          ·
        </span>
        {statuses.map((item) => (
          <button key={item} type="button" className="chip" aria-pressed={status === item} onClick={() => setStatus(item)}>
            {item === 'Revised' ? '✓ Revised' : item}
          </button>
        ))}
      </div>
    </>
  )

  return (
    <AtlasShell
      title={
        <>
          HTML, CSS & JavaScript <span className="scribble">{webQuestions.length} questions</span>
        </>
      }
      lede="The questions that come up in almost every frontend round — each with a short answer you can say out loud, a one-line memory hook, a picture of the idea and a code example."
      sideTitle={searching ? 'Search results' : current.name}
      items={sections.map((s) => ({ key: `${s.topic}-${slug(s.group.name)}`, name: searching ? `${topicName(s.topic)} · ${s.group.name}` : s.group.name, count: s.items.length }))}
      tools={tools}
    >
      {sections.length ? (
        sections.map(({ topic: t, group, groupIndex, items }) => (
          <section key={`${t}-${group.name}`} id={`sec-${t}-${slug(group.name)}`} data-sec={`${t}-${slug(group.name)}`} className="section">
            <div className="pat-head">
              <span className="pat-no">{String(groupIndex + 1).padStart(2, '0')}</span>
              <h2>
                {searching ? `${topicName(t)} · ` : ''}
                {group.name}
              </h2>
              <span className="count">
                {items.length} question{items.length > 1 ? 's' : ''}
              </span>
            </div>
            <div className="cards">
              {items.map(({ question, no }) => (
                <QuestionCard key={question.id} question={question} no={no} revised={revised.has(question.id)} onToggle={() => toggle(question.id)} />
              ))}
            </div>
          </section>
        ))
      ) : (
        <p className="empty">{status === 'Revised' && !searching ? 'Nothing marked revised yet — tick “Mark revised” on a question.' : 'No questions match these filters.'}</p>
      )}
    </AtlasShell>
  )
}
