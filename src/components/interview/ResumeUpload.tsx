import { useId, useState, type ChangeEvent } from 'react'
import { FileText, Upload, X } from 'lucide-react'
import { maxResumeBytes } from '../../../shared/resumeReview'
import { fileToBase64 } from '../../services/resumeApi'

export type ResumeFile = { name: string; base64: string }

type ResumeUploadProps = {
  resume: ResumeFile | null
  onChange: (resume: ResumeFile | null) => void
  disabled?: boolean
}

export function ResumeUpload({ resume, onChange, disabled }: ResumeUploadProps) {
  const inputId = useId()
  const [error, setError] = useState<string | null>(null)

  const handleFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const input = event.target
    const file = input.files?.[0]
    // Clearing the input lets the same file be picked again after removing it.
    input.value = ''
    if (!file) return

    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      setError('Please choose a PDF file.')
    } else if (file.size > maxResumeBytes) {
      setError('The PDF is too large (max 3 MB).')
    } else {
      try {
        onChange({ name: file.name, base64: await fileToBase64(file) })
        setError(null)
      } catch {
        setError('Could not read the file. Please try again.')
      }
    }
  }

  return (
    <section className="rounded-[2rem] border border-slate-800/80 bg-slate-950/90 p-6 shadow-soft" aria-labelledby={`${inputId}-title`}>
      <p className="text-sm uppercase tracking-[0.22em] text-slate-500">Optional</p>
      <h2 id={`${inputId}-title`} className="mt-2 text-2xl font-semibold text-white">
        Add your resume
      </h2>
      <p className="mt-2 text-sm text-slate-400">
        The interview opens with linked questions about one of your projects, matched to your experience and domain.
      </p>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <input id={inputId} type="file" accept="application/pdf,.pdf" className="peer sr-only" onChange={handleFile} disabled={disabled} />
        <label
          htmlFor={inputId}
          className="inline-flex cursor-pointer items-center gap-2 rounded-2xl border border-slate-700 bg-slate-900 px-5 py-3 text-sm font-semibold text-slate-100 transition hover:bg-slate-800 peer-focus-visible:ring-2 peer-focus-visible:ring-primary peer-disabled:cursor-not-allowed peer-disabled:opacity-50"
        >
          <Upload className="h-4 w-4" aria-hidden="true" /> {resume ? 'Choose another PDF' : 'Upload PDF'}
        </label>
        {resume ? (
          <span className="flex min-w-0 items-center gap-2 text-sm text-slate-200">
            <FileText className="h-4 w-4 shrink-0 text-indigo-300" aria-hidden="true" />
            <span className="truncate">{resume.name}</span>
            <button
              type="button"
              onClick={() => onChange(null)}
              disabled={disabled}
              aria-label="Remove resume"
              className="rounded-full p-1 text-slate-400 transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <X className="h-4 w-4" />
            </button>
          </span>
        ) : null}
      </div>

      {error ? (
        <p className="mt-3 text-sm text-rose-300" role="alert">
          {error}
        </p>
      ) : null}
      <p className="mt-3 text-xs text-slate-500">
        PDF, up to 3 MB. It is sent to our AI provider to prepare your questions. We don't save the file; a short summary of your experience
        and projects is stored with this interview.
      </p>
    </section>
  )
}
