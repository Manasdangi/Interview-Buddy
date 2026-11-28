import { useState } from 'react'
import { Download, Loader2, Sparkles } from 'lucide-react'
import type { ImprovedResumeResult } from '../../../shared/improvedResume'
import type { ResumeReview } from '../../../shared/resumeReview'
import { requestImprovedResume } from '../../services/resumeApi'
import type { ResumeVariant } from '../../utils/resumePdf'

const variants: Array<{ value: ResumeVariant; name: string; detail: string }> = [
  { value: 'classic', name: 'Classic', detail: 'Serif, black and white, experience first. A safe choice for most applications.' },
  { value: 'modern', name: 'Modern', detail: 'Sans-serif with a colour accent, skills first. Good when your skills are the stronger point.' },
]

type Props = { review: ResumeReview; role: string; jobDescription: string }

export default function ImprovedResumePanel({ review, role, jobDescription }: Props) {
  const [result, setResult] = useState<ImprovedResumeResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const create = async () => {
    setLoading(true)
    setError(null)
    try {
      const fixes = review.improvements.map((item) => `${item.issue} ${item.fix}`)
      setResult(await requestImprovedResume({ role, jobDescription, resumeText: review.resumeText ?? '', fixes }))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not build the improved resume. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const download = async (variant: ResumeVariant) => {
    if (!result) return
    setError(null)
    try {
      // The PDF library is only loaded when someone downloads.
      const { downloadResumePdf } = await import('../../utils/resumePdf')
      downloadResumePdf(result.resume, variant)
    } catch {
      setError('Could not create the PDF. Please try again.')
    }
  }

  return (
    <section className="rounded-[1.5rem] border border-indigo-500/40 bg-indigo-500/5 p-5 shadow-soft sm:p-6" aria-labelledby="rr-improved">
      <h3 id="rr-improved" className="text-lg font-semibold text-white">
        Download an improved resume
      </h3>
      <p className="mt-1 text-sm text-slate-400">
        We rewrite your resume using the fixes below, in two layouts. It only uses what is already in your resume: missing keywords and
        numbers are not invented.
      </p>

      {result ? (
        <>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {variants.map((variant) => (
              <div key={variant.value} className="flex flex-col items-start rounded-2xl border border-slate-800 bg-slate-950/90 p-4">
                <p className="font-semibold text-white">{variant.name}</p>
                <p className="mt-1 flex-1 text-sm text-slate-400">{variant.detail}</p>
                <button
                  type="button"
                  onClick={() => void download(variant.value)}
                  className="mt-3 inline-flex items-center gap-2 rounded-2xl bg-primary px-4 py-2.5 text-sm font-semibold text-pure transition hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  <Download className="h-4 w-4" aria-hidden="true" /> Download {variant.name} PDF
                </button>
              </div>
            ))}
          </div>
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
          <p className="mt-3 text-xs text-slate-500">Read every line before sending it. AI rewrites can change the meaning of what you did.</p>
        </>
      ) : (
        <button
          type="button"
          onClick={() => void create()}
          disabled={loading}
          className="mt-4 inline-flex items-center gap-2 rounded-2xl bg-primary px-5 py-3 text-sm font-semibold text-pure transition hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Sparkles className="h-4 w-4" aria-hidden="true" />}
          {loading ? 'Rewriting your resume… (about 30–50 s)' : 'Create improved resume'}
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
