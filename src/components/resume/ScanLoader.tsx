import { useEffect, useState } from 'react'
import { CheckCircle2, Loader2 } from 'lucide-react'
import { cn } from '../../utils/cn'
import './scanLoader.css'

/** Shown while the resume is analysed: a resume being scanned, keywords lighting up, and the steps of the check. */
const steps = [
  { at: 0, label: 'Reading your resume like an ATS parser' },
  { at: 4, label: 'Pulling keywords from the job / role' },
  { at: 10, label: 'Matching hard and soft skills' },
  { at: 18, label: 'Checking title, experience and education' },
  { at: 24, label: 'Running formatting checks' },
  { at: 30, label: 'Calculating your score and writing fixes' },
]

const tips = [
  'Hard skills carry 45 of the 100 points.',
  'Required skills count double compared with preferred ones.',
  'Paste a job description to get a real match rate.',
  'Aim for 75%+ before you hit apply.',
  'Use the exact job title in your headline if it is true.',
  'Numbers in bullets ("cut load time 40%") are noticed by recruiters.',
]

// Each line of the mini resume: width in %, and whether it is a keyword that lights up.
const lines: Array<[number, boolean]> = [
  [70, false], [85, true], [60, false], [90, false], [75, true], [55, false], [80, true], [65, false], [88, false], [50, true], [72, false],
]

export default function ScanLoader() {
  const [seconds, setSeconds] = useState(0)

  useEffect(() => {
    const start = Date.now()
    const id = window.setInterval(() => setSeconds((Date.now() - start) / 1000), 250)
    return () => window.clearInterval(id)
  }, [])

  // Eases towards 95% so it never sits at 100% before the answer arrives.
  const progress = Math.round(95 * (1 - Math.exp(-seconds / 14)))
  const current = steps.reduce((idx, step, i) => (seconds >= step.at ? i : idx), 0)
  const tip = tips[Math.floor(seconds / 5) % tips.length]

  return (
    <div
      role="status"
      aria-live="polite"
      className="grid items-center gap-8 rounded-[1.5rem] border border-slate-800/80 bg-slate-950/90 p-6 shadow-soft sm:p-8 md:grid-cols-[auto_1fr]"
    >
      <div className="scan-paper mx-auto" aria-hidden="true">
        <div className="scan-paper__head">
          <span className="scan-paper__avatar" />
          <span className="scan-paper__name" />
        </div>
        {lines.map(([width, keyword], i) => (
          <span
            key={i}
            className={cn('scan-paper__line', keyword && 'scan-paper__line--kw')}
            style={{ width: `${width}%`, animationDelay: keyword ? `${(i * 0.37) % 2.4}s` : undefined }}
          />
        ))}
        <span className="scan-paper__beam" />
        <span className="scan-paper__lens" />
      </div>

      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-indigo-300">Scanning</p>
        <p className="mt-1 text-xl font-semibold text-white">
          {progress}% <span className="text-sm font-normal text-slate-400">· {Math.floor(seconds)}s</span>
        </p>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-800">
          <div className="scan-progress h-2 rounded-full bg-gradient-to-r from-indigo-500 to-fuchsia-500 transition-[width] duration-300" style={{ width: `${progress}%` }} />
        </div>

        <ol className="mt-5 space-y-2">
          {steps.map((step, i) => (
            <li
              key={step.label}
              className={cn(
                'flex items-center gap-2.5 text-sm transition-opacity',
                i < current ? 'text-slate-300' : i === current ? 'font-medium text-white' : 'text-slate-500 opacity-60',
              )}
            >
              {i < current ? (
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-300" aria-hidden="true" />
              ) : i === current ? (
                <Loader2 className="h-4 w-4 shrink-0 animate-spin text-indigo-300" aria-hidden="true" />
              ) : (
                <span className="ml-1 mr-1 h-2 w-2 shrink-0 rounded-full bg-slate-700" aria-hidden="true" />
              )}
              {step.label}
            </li>
          ))}
        </ol>

        <p key={tip} className="scan-tip mt-5 rounded-xl border border-slate-800 bg-slate-900/50 px-3 py-2 text-sm text-slate-400">
          <span className="font-semibold text-slate-300">Tip:</span> {tip}
        </p>
      </div>
    </div>
  )
}
