import { useEffect, useMemo, useState } from 'react'
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

function QuestionCard({ question, no }: { question: WebQuestion; no: number }) {
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
    <article className="card" id={question.id}>
      <div className="card-head">
        <span className="qno">#{no}</span>
        <h3>
          <a href={`#${question.id}`}>{question.title}</a>
        </h3>
        <span className={`pill ${question.level}`}>{question.level}</span>
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

  const hashId = location.hash.slice(1)
  const linked = webQuestions.find((question) => question.id === hashId)
  const topic: WebTopic = linked?.topic ?? (isTopic(params.get('topic')) ? (params.get('topic') as WebTopic) : 'html')
  const current = webTopics.find((item) => item.key === topic) ?? webTopics[0]

  // A shared link (#question-id) scrolls to that question.
  useEffect(() => {
    if (!linked) return
    window.requestAnimationFrame(() => document.getElementById(linked.id)?.scrollIntoView({ block: 'start' }))
  }, [linked])

  const sections = useMemo(() => {
    const needle = query.trim().toLowerCase()
    const inTopic = webQuestions.filter((q) => q.topic === topic)
    return webGroups[topic]
      .map((group) => ({
        group,
        items: inTopic
          .map((question, index) => ({ question, no: index + 1 }))
          .filter(
            ({ question }) =>
              question.group === group.name &&
              (level === 'All levels' || question.level === level) &&
              (!needle ||
                question.title.toLowerCase().includes(needle) ||
                question.answer.toLowerCase().includes(needle) ||
                question.remember.toLowerCase().includes(needle) ||
                (question.cases ?? []).some(([c, r]) => c.toLowerCase().includes(needle) || r.toLowerCase().includes(needle))),
          ),
      }))
      .filter((section) => section.items.length)
  }, [topic, query, level])

  const shown = sections.reduce((total, section) => total + section.items.length, 0)

  const switchTopic = (next: WebTopic) => {
    setQuery('')
    navigate({ search: `?topic=${next}`, hash: '' }, { replace: true })
    window.scrollTo({ top: 0 })
  }

  const tools = (
    <>
      <div className="row">
        <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder={`Search ${current.name} questions (e.g. closure, flex, cors)`} aria-label="Search questions" />
        <span className="progress">
          {shown} / {webQuestions.filter((q) => q.topic === topic).length} shown
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
      sideTitle={current.name}
      items={sections.map((s) => ({ key: slug(s.group.name), name: s.group.name, count: s.items.length }))}
      tools={tools}
    >
      {sections.length ? (
        sections.map(({ group, items }, index) => (
          <section key={group.name} id={`sec-${slug(group.name)}`} data-sec={slug(group.name)} className="section">
            <div className="pat-head">
              <span className="pat-no">{String(webGroups[topic].indexOf(group) + 1 || index + 1).padStart(2, '0')}</span>
              <h2>{group.name}</h2>
              <span className="count">
                {items.length} question{items.length > 1 ? 's' : ''}
              </span>
            </div>
            <div className="cards">
              {items.map(({ question, no }) => (
                <QuestionCard key={question.id} question={question} no={no} />
              ))}
            </div>
          </section>
        ))
      ) : (
        <p className="empty">No questions match these filters.</p>
      )}
    </AtlasShell>
  )
}
