import { useState } from 'react'
import { highlight } from '../atlas/highlight'

/** "More cases": extra examples with their result. Quiz mode hides results until tapped. */
export function WebCases({ cases, lang }: { cases: [string, string][]; lang: 'js' | 'plain' }) {
  const [open, setOpen] = useState(false)
  const [quiz, setQuiz] = useState(false)
  const [shown, setShown] = useState<Set<number>>(new Set())

  const toggleQuiz = () => {
    setQuiz((q) => !q)
    setShown(new Set())
  }
  const reveal = (i: number) => setShown((prev) => new Set(prev).add(i))

  return (
    <section className={open ? "cases open" : "cases"} aria-label="More cases">
      <div className="cases-head">
        <button type="button" className="cases-toggle" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
          <span className="cases-chev" aria-hidden="true">▸</span>
          <span className="cases-tag">More cases</span>
          <span className="cases-count">{cases.length}</span>
        </button>
        {open ? (
          <button type="button" className="chip cases-quiz" aria-pressed={quiz} onClick={toggleQuiz}>
            {quiz ? 'Show all answers' : 'Quiz me'}
          </button>
        ) : null}
      </div>
      {open ? (
        <ol className="cases-list">
          {cases.map(([code, result], i) => (
            <li key={code}>
              <code className="cases-code" dangerouslySetInnerHTML={{ __html: highlight(code, lang) }} />
              {quiz && !shown.has(i) ? (
                <button type="button" className="cases-reveal" onClick={() => reveal(i)}>
                  Think, then tap to reveal
                </button>
              ) : (
                <p className="cases-res">
                  <span aria-hidden="true">→</span> {result}
                </p>
              )}
            </li>
          ))}
        </ol>
      ) : null}
    </section>
  )
}
