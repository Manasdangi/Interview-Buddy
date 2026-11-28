import { useEffect, useState } from 'react'
import { NotebookPen } from 'lucide-react'

/** A private scratchpad, like paper beside a real interview. It is never sent to the interviewer. */
export function InterviewNotes({ sessionId }: { sessionId: string }) {
  const key = `ib-notes-${sessionId}`
  const [notes, setNotes] = useState(() => {
    try {
      return window.sessionStorage.getItem(key) ?? ''
    } catch {
      return ''
    }
  })

  useEffect(() => {
    try {
      window.sessionStorage.setItem(key, notes)
    } catch {
      /* private mode: notes stay in memory */
    }
  }, [key, notes])

  return (
    <label className="block rounded-3xl border border-slate-800 bg-slate-950/90 p-3">
      <span className="mb-1.5 flex items-center gap-2 text-xs font-medium uppercase tracking-[0.2em] text-slate-500">
        <NotebookPen className="h-3.5 w-3.5" aria-hidden="true" />
        Notes (only you see this)
      </span>
      <textarea
        value={notes}
        onChange={(event) => setNotes(event.target.value)}
        rows={3}
        placeholder="Jot down the question, your approach, edge cases…"
        className="w-full resize-y rounded-2xl border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      />
    </label>
  )
}
