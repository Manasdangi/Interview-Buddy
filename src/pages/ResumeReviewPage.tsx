import { useRef, useState, type DragEvent } from 'react'
import { AlertTriangle, ArrowRight, Briefcase, CheckCircle2, ChevronDown, Clock, FileText, Loader2, RotateCcw, Upload, X, Zap } from 'lucide-react'
import {
  maxJobDescriptionLength,
  maxResumeBytes,
  resumeExperienceLevels,
  resumeRoles,
  type ResumeImprovement,
  type ResumeReview,
} from '../../shared/resumeReview'
import { fileToBase64, requestResumeReview } from '../services/resumeApi'
import { cn } from '../utils/cn'
import ScanLoader from '../components/resume/ScanLoader'
import ImprovedResumePanel from '../components/resume/ImprovedResumePanel'

const card = 'rounded-[1.5rem] border border-slate-800/80 bg-slate-950/90 p-5 shadow-soft sm:p-6'
const jdPlaceholder = `Paste the job description here...

Include:
• Job title and responsibilities
• Required skills and qualifications
• Years of experience needed
• Technical requirements
• Soft skills mentioned`

const band = (score: number) =>
  score >= 85
    ? { label: 'Ready to send', text: 'text-emerald-300', bar: 'bg-emerald-400', ring: '#34d399' }
    : score >= 70
      ? { label: 'Good, with fixes', text: 'text-indigo-300', bar: 'bg-indigo-400', ring: '#818cf8' }
      : score >= 50
        ? { label: 'Needs work', text: 'text-amber-300', bar: 'bg-amber-400', ring: '#fbbf24' }
        : { label: 'Major rework', text: 'text-rose-300', bar: 'bg-rose-400', ring: '#fb7185' }

const priorityStyle: Record<ResumeImprovement['priority'], string> = {
  high: 'bg-rose-500/10 text-rose-300',
  medium: 'bg-amber-500/10 text-amber-300',
  low: 'bg-slate-800 text-slate-300',
}

function Select({ id, value, onChange, placeholder, options }: { id: string; value: string; onChange: (v: string) => void; placeholder: string; options: readonly string[] }) {
  return (
    <div className="relative">
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          'w-full appearance-none rounded-2xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 pr-10 text-sm outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/30',
          value ? 'text-white' : 'text-slate-500',
        )}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
    </div>
  )
}

function ScoreRing({ score }: { score: number }) {
  const r = 52
  const c = 2 * Math.PI * r
  const b = band(score)
  return (
    <div className="relative h-28 w-28 shrink-0">
      <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90" aria-hidden="true">
        <circle cx="60" cy="60" r={r} fill="none" strokeWidth="10" className="stroke-slate-800" />
        <circle cx="60" cy="60" r={r} fill="none" strokeWidth="10" strokeLinecap="round" stroke={b.ring} strokeDasharray={c} strokeDashoffset={c * (1 - score / 100)} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-semibold text-white">{score}</span>
        <span className="text-[10px] uppercase tracking-[0.2em] text-slate-400">ATS score</span>
      </div>
    </div>
  )
}

type Target = { role: string; jobDescription: string; file: File }

function Report({ review, target, onReset }: { review: ResumeReview; target: Target; onReset: () => void }) {
  const b = band(review.atsScore)
  return (
    <div className="space-y-5" aria-live="polite">
      <div className={cn(card, 'flex flex-col gap-5 sm:flex-row sm:items-center')}>
        <ScoreRing score={review.atsScore} />
        <div className="min-w-0 flex-1 space-y-2">
          <p className={cn('text-sm font-semibold uppercase tracking-[0.2em]', b.text)}>{b.label}</p>
          <h2 className="text-xl font-semibold text-white">{review.verdict}</h2>
          <p className="text-sm text-slate-400">{review.summary}</p>
          {review.jdMatch !== null ? (
            <p className="text-sm text-slate-300">
              Job description match: <span className={cn('font-semibold', band(review.jdMatch).text)}>{review.jdMatch}%</span>
            </p>
          ) : null}
        </div>
        <button
          type="button"
          onClick={onReset}
          className="inline-flex items-center gap-2 self-start rounded-full border border-slate-700 px-4 py-2 text-sm font-medium text-slate-300 transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          <RotateCcw className="h-4 w-4" aria-hidden="true" /> Check another
        </button>
      </div>

      {review.atsScore > 0 ? (
        <ImprovedResumePanel review={review} {...target} />
      ) : null}

      <div className="grid gap-5 lg:grid-cols-2">
        <section className={card} aria-labelledby="rr-breakdown">
          <h3 id="rr-breakdown" className="text-lg font-semibold text-white">
            Score breakdown
          </h3>
          <ul className="mt-4 space-y-4">
            {review.sections.map((section) => (
              <li key={section.name}>
                <div className="flex items-center justify-between gap-3 text-sm">
                  <span className="font-medium text-slate-200">{section.name}</span>
                  <span className={cn('font-mono font-semibold', band(section.score).text)}>
                    {section.max !== undefined ? `${section.points ?? 0} / ${section.max}` : section.score}
                  </span>
                </div>
                <div className="mt-1.5 h-2 rounded-full bg-slate-800">
                  <div className={cn('h-2 rounded-full', band(section.score).bar)} style={{ width: `${section.score}%` }} />
                </div>
                <p className="mt-1.5 text-sm text-slate-400">{section.feedback}</p>
              </li>
            ))}
          </ul>
          {review.checks?.length ? (
            <>
              <p className="mt-5 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Formatting checklist</p>
              <ul className="mt-2 space-y-1.5">
                {review.checks.map((check) => (
                  <li key={check.label} className="flex gap-2 text-sm text-slate-300">
                    {check.ok ? (
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300" aria-label="Passed" />
                    ) : (
                      <X className="mt-0.5 h-4 w-4 shrink-0 text-rose-300" aria-label="Failed" />
                    )}
                    {check.label}
                  </li>
                ))}
              </ul>
            </>
          ) : null}
          <details className="mt-5 text-sm text-slate-400">
            <summary className="cursor-pointer font-medium text-slate-300">How is this score calculated?</summary>
            <p className="mt-2">
              The same way match-rate tools like Jobscan work: keywords are taken from the {review.keywordSource === 'role' ? 'typical requirements for your role (paste a job description for a real match)' : 'job description'} and
              searched for in your resume text, with aliases (JS = JavaScript) and plurals. Hard skills 45 pts, soft skills 10, job title 10, years of
              experience 10, education 5, formatting &amp; searchability 20. Required skills count double. The points are computed in code, so the same
              resume and job description always get the same score.
            </p>
          </details>
        </section>

        <section className={card} aria-labelledby="rr-keywords">
          <h3 id="rr-keywords" className="text-lg font-semibold text-white">
            Keywords
          </h3>
          <p className="mt-4 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-300">Found ({review.matchedKeywords.length})</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {review.matchedKeywords.map((k) => (
              <span key={k} className="rounded-full bg-emerald-500/10 px-3 py-1 text-sm text-emerald-300">
                {k}
              </span>
            ))}
          </div>
          <p className="mt-5 text-xs font-semibold uppercase tracking-[0.18em] text-rose-300">Missing ({review.missingKeywords.length})</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {review.missingKeywords.map((k) => (
              <span key={k} className="rounded-full border border-dashed border-rose-400/50 px-3 py-1 text-sm text-rose-300">
                {k}
              </span>
            ))}
          </div>
          <p className="mt-4 text-xs text-slate-500">Add a missing keyword only if it is true for you.</p>

          <h3 className="mt-6 text-lg font-semibold text-white">ATS parsing issues</h3>
          {review.atsIssues.length ? (
            <ul className="mt-3 space-y-2">
              {review.atsIssues.map((issue) => (
                <li key={issue} className="flex gap-2 text-sm text-slate-300">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" aria-hidden="true" />
                  {issue}
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 flex gap-2 text-sm text-slate-300">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-300" aria-hidden="true" /> No parsing problems found.
            </p>
          )}
        </section>
      </div>

      <section className={card} aria-labelledby="rr-fixes">
        <h3 id="rr-fixes" className="text-lg font-semibold text-white">
          What to fix
        </h3>
        <ol className="mt-4 space-y-3">
          {review.improvements.map((item, index) => (
            <li key={index} className="rounded-2xl border border-slate-800 p-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className={cn('rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase', priorityStyle[item.priority])}>{item.priority}</span>
                <span className="font-medium text-white">{item.issue}</span>
              </div>
              <p className="mt-1.5 text-sm text-slate-400">{item.fix}</p>
            </li>
          ))}
        </ol>
      </section>

      {review.rewrites.length ? (
        <section className={card} aria-labelledby="rr-rewrites">
          <h3 id="rr-rewrites" className="text-lg font-semibold text-white">
            Bullet rewrites
          </h3>
          <p className="mt-1 text-sm text-slate-400">Replace placeholders like [X%] with your real numbers.</p>
          <ul className="mt-4 space-y-4">
            {review.rewrites.map((rewrite, index) => (
              <li key={index} className="grid items-center gap-3 md:grid-cols-[1fr_auto_1fr]">
                <p className="rounded-2xl border border-slate-800 bg-slate-900/50 p-3 text-sm text-slate-400 line-through decoration-rose-400/50">{rewrite.before}</p>
                <ArrowRight className="hidden h-4 w-4 text-slate-500 md:block" aria-hidden="true" />
                <p className="rounded-2xl border border-emerald-400/40 bg-emerald-500/10 p-3 text-sm text-slate-200">{rewrite.after}</p>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {review.strengths.length ? (
        <section className={card} aria-labelledby="rr-strengths">
          <h3 id="rr-strengths" className="text-lg font-semibold text-white">
            What already works
          </h3>
          <ul className="mt-3 space-y-2">
            {review.strengths.map((s) => (
              <li key={s} className="flex gap-2 text-sm text-slate-300">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300" aria-hidden="true" />
                {s}
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  )
}

export default function ResumeReviewPage() {
  const [role, setRole] = useState('')
  const [experience, setExperience] = useState('')
  const [jd, setJd] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [dragging, setDragging] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [review, setReview] = useState<ResumeReview | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const pick = (f: File | undefined) => {
    setError(null)
    if (!f) return
    if (f.type !== 'application/pdf' && !f.name.toLowerCase().endsWith('.pdf')) return setError('Please upload a PDF.')
    if (f.size > maxResumeBytes) return setError('The PDF is too large (max 3 MB).')
    setFile(f)
  }

  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setDragging(false)
    pick(e.dataTransfer.files[0])
  }

  const ready = Boolean(role && experience && file) && !loading

  const analyze = async () => {
    if (!file || !ready) return
    setLoading(true)
    setError(null)
    try {
      const resumeBase64 = await fileToBase64(file)
      setReview(await requestResumeReview({ role, experience, jobDescription: jd.trim(), resumeBase64 }))
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not review the resume. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-5xl space-y-5">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-indigo-300">Resume ATS checker</p>
        <h1 className="mt-2 text-2xl font-semibold text-white sm:text-3xl">Will your resume get past the ATS?</h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-400">
          Upload your resume, pick the role you are aiming for and (optionally) paste the job description. You get an ATS score, missing keywords,
          parsing problems and exact fixes. Your file is only used for this check and is not stored.
        </p>
      </div>

      {review && file ? (
        <Report review={review} target={{ role, jobDescription: jd.trim(), file }} onReset={() => setReview(null)} />
      ) : loading ? (
        <ScanLoader />
      ) : (
        <>
          <div className={cn(card, 'grid gap-5 md:grid-cols-2')}>
            <div className="space-y-2">
              <label htmlFor="rr-role" className="flex items-center gap-2 text-sm font-semibold text-white">
                <Briefcase className="h-4 w-4" aria-hidden="true" /> Target Role
              </label>
              <Select id="rr-role" value={role} onChange={setRole} placeholder="Select Role" options={resumeRoles} />
            </div>
            <div className="space-y-2">
              <label htmlFor="rr-exp" className="flex items-center gap-2 text-sm font-semibold text-white">
                <Clock className="h-4 w-4" aria-hidden="true" /> Experience Level
              </label>
              <Select id="rr-exp" value={experience} onChange={setExperience} placeholder="Select Experience" options={resumeExperienceLevels} />
            </div>
          </div>

          <div className="grid gap-5 lg:grid-cols-2">
            <section className={card} aria-labelledby="rr-resume">
              <h2 id="rr-resume" className="flex items-center gap-2 text-lg font-semibold text-white">
                <FileText className="h-5 w-5" aria-hidden="true" /> Resume
              </h2>
              <div
                role="button"
                tabIndex={0}
                onClick={() => inputRef.current?.click()}
                onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), inputRef.current?.click())}
                onDragOver={(e) => {
                  e.preventDefault()
                  setDragging(true)
                }}
                onDragLeave={() => setDragging(false)}
                onDrop={onDrop}
                aria-label="Upload resume PDF"
                className={cn(
                  'mt-4 flex min-h-[11rem] cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-6 text-center transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
                  dragging ? 'border-indigo-400 bg-indigo-500/10' : 'border-slate-800 bg-slate-900/40 hover:border-slate-600',
                )}
              >
                <input ref={inputRef} type="file" accept="application/pdf,.pdf" className="hidden" onChange={(e) => pick(e.target.files?.[0])} />
                {file ? (
                  <>
                    <FileText className="h-8 w-8 text-indigo-300" aria-hidden="true" />
                    <p className="mt-4 max-w-full truncate font-medium text-white">{file.name}</p>
                    <p className="text-sm text-slate-400">{(file.size / 1024).toFixed(0)} KB · click to replace</p>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        setFile(null)
                        if (inputRef.current) inputRef.current.value = ''
                      }}
                      className="mt-3 inline-flex items-center gap-1 text-sm text-slate-400 hover:text-rose-300"
                    >
                      <X className="h-4 w-4" aria-hidden="true" /> Remove
                    </button>
                  </>
                ) : (
                  <>
                    <Upload className="h-8 w-8 text-indigo-400" aria-hidden="true" />
                    <p className="mt-3 text-base font-medium text-white">Drag &amp; drop your resume here</p>
                    <p className="mt-1 text-sm text-slate-400">or click to browse (PDF only, max 3 MB)</p>
                  </>
                )}
              </div>
            </section>

            <section className={card} aria-labelledby="rr-jd">
              <h2 id="rr-jd" className="flex items-center gap-2 text-lg font-semibold text-white">
                <Briefcase className="h-5 w-5" aria-hidden="true" /> Job Description <span className="text-sm font-normal text-slate-400">(Optional)</span>
              </h2>
              <textarea
                value={jd}
                onChange={(e) => setJd(e.target.value.slice(0, maxJobDescriptionLength))}
                placeholder={jdPlaceholder}
                aria-labelledby="rr-jd"
                className="mt-4 h-44 w-full resize-y rounded-2xl border border-slate-800 bg-slate-950 p-3.5 text-sm text-white placeholder:text-slate-500 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/30"
              />
              <p className="mt-1.5 text-right text-xs text-slate-500">
                {jd.length.toLocaleString()} / {maxJobDescriptionLength.toLocaleString()} characters
              </p>
            </section>
          </div>

          {error ? (
            <p role="alert" className="rounded-2xl border border-rose-400/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
              {error}
            </p>
          ) : null}

          <button
            type="button"
            onClick={analyze}
            disabled={!ready}
            className="flex w-full items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-indigo-500 to-fuchsia-500 px-6 py-3 text-base font-semibold text-pure shadow-soft transition hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" /> : <Zap className="h-5 w-5" aria-hidden="true" />}
            {loading ? 'Analyzing your resume… (about 20–40 s)' : 'Analyze Resume'}
          </button>
          {!role || !experience || !file ? <p className="-mt-3 text-center text-xs text-slate-500">Pick a role and experience level and upload your PDF to start.</p> : null}
        </>
      )}
    </div>
  )
}
