import { useState } from 'react'
import { Download, Loader2, Sparkles } from 'lucide-react'
import type { ResumeReview } from '../../../shared/resumeReview'
import { requestImprovedResume } from '../../services/resumeApi'
import type { AppliedEdit } from '../../utils/pdfEdit'

type Props = { review: ResumeReview; role: string; jobDescription: string; file: File }
type Result = { pdf: Blob; applied: AppliedEdit[]; skipped: number; todo: string[] }

/** Replaces the PDF library's technical errors with one the candidate can act on. */
function editPdf<T>(run: () => T): T {
  try {
    return run()
  } catch {
    throw new Error('This PDF could not be edited. Try exporting it again from the tool you made it in.')
  }
}

const primaryButton =
  'mt-4 inline-flex items-center gap-2 rounded-2xl bg-primary px-5 py-3 text-sm font-semibold text-pure transition hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-60'

export default function ImprovedResumePanel({ review, role, jobDescription, file }: Props) {
  const [result, setResult] = useState<Result | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const create = async () => {
    setLoading(true)
    setError(null)
    try {
      // The PDF editor is large, so it is only loaded when someone asks for it.
      const { readResume, applyEdits } = await import('../../utils/pdfEdit')
      const bytes = new Uint8Array(await file.arrayBuffer())
      const { paragraphs, text } = editPdf(() => readResume(bytes))
      if (!paragraphs.length) throw new Error('We found no editable text in this PDF. A scanned or image-only resume cannot be edited.')
      const fixes = [
        ...review.improvements.map((item) => `${item.issue} ${item.fix}`),
        ...review.rewrites.map((item) => `Weak line: "${item.before}" Better: "${item.after}"`),
      ]
      const { edits, todo } = await requestImprovedResume({
        role,
        jobDescription,
        resumeText: text,
        paragraphs,
        fixes,
        missingKeywords: review.missingKeywords,
        matchedKeywords: review.matchedKeywords,
      })
      const { pdf, applied, skipped } = editPdf(() => applyEdits(bytes, edits))
      setResult({ pdf: new Blob([new Uint8Array(pdf)], { type: 'application/pdf' }), applied, skipped, todo })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not improve the resume. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const download = (pdf: Blob) => {
    const url = URL.createObjectURL(pdf)
    const link = document.createElement('a')
    link.href = url
    link.download = `${file.name.replace(/\.pdf$/i, '')}-improved.pdf`
    link.click()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
  }

  return (
    <section className="rounded-[1.5rem] border border-indigo-500/40 bg-indigo-500/5 p-5 shadow-soft sm:p-6" aria-labelledby="rr-improved">
      <h3 id="rr-improved" className="text-lg font-semibold text-white">
        Download your improved resume
      </h3>
      <p className="mt-1 text-sm text-slate-400">
        Your own PDF with the same design: only the lines that need work are rewritten. It only uses what is already in your resume, so
        missing keywords and numbers are not invented.
      </p>

      {result ? (
        <>
          {result.applied.length ? (
            <>
              <button type="button" onClick={() => download(result.pdf)} className={primaryButton}>
                <Download className="h-4 w-4" aria-hidden="true" /> Download improved PDF
              </button>
              <p className="mt-4 text-sm font-semibold text-white">
                {result.applied.length} change{result.applied.length > 1 ? 's' : ''}
              </p>
              <ul className="mt-2 space-y-2">
                {result.applied.map((change) => (
                  <li key={change.id} className="rounded-2xl border border-slate-800 bg-slate-950/90 p-4 text-sm">
                    <p className="text-slate-500">
                      <span className="sr-only">Before: </span>
                      <del>{change.before}</del>
                    </p>
                    <p className="mt-1 text-slate-200">
                      <span className="sr-only">After: </span>
                      {change.after}
                    </p>
                    {change.substitutedFont ? <p className="mt-1 text-xs text-amber-300">Uses a similar font, because yours could not be reused for this line.</p> : null}
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <p className="mt-4 text-sm text-slate-300">We could not safely change any line in this PDF, so there is nothing new to download.</p>
          )}
          {result.skipped ? (
            <p className="mt-3 text-sm text-slate-400">
              {result.skipped} more change{result.skipped > 1 ? 's' : ''} did not fit this PDF cleanly, so the original text was kept.
            </p>
          ) : null}
          {result.todo.length ? (
            <div className="mt-4">
              <p className="text-sm font-semibold text-white">Make it stronger yourself</p>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-300">
                {result.todo.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          ) : null}
          {result.applied.length ? (
            <p className="mt-3 text-xs text-slate-500">
              Open the PDF and read every change before sending it. AI rewrites can change the meaning of what you did.
            </p>
          ) : null}
        </>
      ) : (
        <button type="button" onClick={() => void create()} disabled={loading} className={primaryButton}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Sparkles className="h-4 w-4" aria-hidden="true" />}
          {loading ? 'Improving your resume… (about 20–40 s)' : 'Create improved resume'}
        </button>
      )}

      {error ? (
        <p role="alert" className="mt-3 text-sm text-rose-300">
          {error}
        </p>
      ) : null}
    </section>
  )
}
