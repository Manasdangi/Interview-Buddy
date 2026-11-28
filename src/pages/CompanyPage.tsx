import { useState } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Clock } from 'lucide-react'
import {
  companyCategoryLabels,
  findCompany,
  roleDefinitions,
  roundTypeLabels,
  type CompanyRoleLevel,
  type CompanyRoundBlueprint,
} from '../../shared/companyCatalog'
import { ResumeUpload, type ResumeFile } from '../components/interview/ResumeUpload'
import { Button } from '../components/ui/Button'
import { ErrorToast } from '../components/ui/ErrorToast'
import { CompanyMonogram } from '../components/company/CompanyMonogram'
import { useInterviewStore } from '../store/interviewStore'
import { unlockAudio } from '../utils/liveSpeaker'
import { cn } from '../utils/cn'

const roleLevels: CompanyRoleLevel[] = ['FE1', 'FE2']

export default function CompanyPage() {
  const { companyId } = useParams<{ companyId: string }>()
  const company = findCompany(companyId)
  const [role, setRole] = useState<CompanyRoleLevel>('FE1')
  const [startingRound, setStartingRound] = useState<string | null>(null)
  const [resume, setResume] = useState<ResumeFile | null>(null)
  const navigate = useNavigate()
  const { startInterview, starting, error } = useInterviewStore()

  if (!company) return <Navigate to="/companies" replace />

  const roleInfo = roleDefinitions[role]

  const handleStart = async (round: CompanyRoundBlueprint) => {
    // This tap allows the interviewer's voice to play as soon as the interview page opens.
    unlockAudio()
    setStartingRound(round.type)
    const session = await startInterview(round.type, roleInfo.difficulty, undefined, { companyId: company.id, role }, resume?.base64)
    setStartingRound(null)
    if (session) navigate(`/interview/${session.id}`)
  }

  return (
    <div className="space-y-8">
      <Link to="/companies" className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white">
        <ArrowLeft className="h-4 w-4" aria-hidden="true" /> All companies
      </Link>

      <div className="rounded-[2rem] border border-slate-800/80 bg-slate-950/90 p-8 shadow-soft">
        <div className="flex flex-wrap items-center gap-5">
          <CompanyMonogram companyId={company.id} name={company.name} size="lg" />
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-slate-500">{companyCategoryLabels[company.category]}</p>
            <h1 className="mt-1 text-4xl font-semibold text-white">{company.name} frontend mock interview</h1>
            <p className="mt-2 text-slate-400">{company.tagline}</p>
          </div>
        </div>
        <p className="mt-6 max-w-3xl text-sm leading-6 text-slate-300">
          <span className="font-semibold text-white">What candidates report: </span>
          {company.bar}
        </p>
      </div>

      <section className="rounded-[2rem] border border-slate-800/80 bg-slate-950/90 p-6 shadow-soft">
        <h2 className="text-sm uppercase tracking-[0.22em] text-slate-500">Role you're applying for</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2" role="radiogroup" aria-label="Role">
          {roleLevels.map((level) => {
            const item = roleDefinitions[level]
            return (
              <button
                key={level}
                type="button"
                role="radio"
                aria-checked={role === level}
                onClick={() => setRole(level)}
                className={cn(
                  'rounded-2xl border p-4 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
                  role === level ? 'border-indigo-300 bg-indigo-950/50' : 'border-slate-800 bg-slate-900/70 hover:border-slate-600',
                )}
              >
                <span className="block font-semibold text-white">{item.label}</span>
                <span className="mt-1 block text-sm text-slate-400">{item.experience} experience</span>
              </button>
            )
          })}
        </div>
        <p className="mt-4 text-sm text-slate-400">
          <span className="font-semibold text-slate-200">Bar for this role: </span>
          {roleInfo.expectations}
        </p>
      </section>

      <ResumeUpload resume={resume} onChange={setResume} disabled={starting} />

      <section className="space-y-4" aria-label="Interview rounds">
        {company.rounds.map((round, index) => (
          <article key={round.type} className="rounded-[2rem] border border-slate-800/80 bg-slate-950/90 p-6 shadow-soft">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="max-w-3xl">
                <p className="text-xs uppercase tracking-[0.22em] text-slate-500">
                  Round {index + 1} · {roundTypeLabels[round.type]}
                </p>
                <h3 className="mt-2 text-2xl font-semibold text-white">{round.title}</h3>
                <p className="mt-2 flex items-center gap-2 text-sm text-slate-400">
                  <Clock className="h-4 w-4" aria-hidden="true" /> {round.durationMinutes} minutes
                  {round.type === 'SYSTEM_DESIGN' && role === 'FE1' ? (
                    <span className="ml-2 rounded-full bg-amber-500/10 px-2 py-0.5 text-xs text-amber-300">Usually for FE2 and above</span>
                  ) : null}
                </p>
                <p className="mt-4 text-slate-300">{round.format}</p>
                <p className="mt-2 text-sm text-slate-400">
                  <span className="font-semibold text-slate-200">Interviewer style: </span>
                  {round.interviewerStyle}
                </p>
                <ul className="mt-4 flex flex-wrap gap-2" aria-label="Focus areas">
                  {round.topics.slice(0, 6).map((topic) => (
                    <li key={topic} className="rounded-full border border-slate-800 bg-slate-900 px-3 py-1 text-xs text-slate-300">
                      {topic}
                    </li>
                  ))}
                  {round.behavioralTopic ? (
                    <li className="rounded-full border border-indigo-800/60 bg-indigo-950/40 px-3 py-1 text-xs text-indigo-200">+ behavioural</li>
                  ) : null}
                </ul>
              </div>
              <Button className="shrink-0" onClick={() => void handleStart(round)} disabled={starting}>
                {startingRound === round.type ? (resume ? 'Reading your resume…' : 'Starting…') : 'Start mock round'}
              </Button>
            </div>
          </article>
        ))}
      </section>

      <p className="text-xs text-slate-500">
        Rounds are modelled on publicly reported interview patterns and use original practice questions. Interview Buddy is not affiliated with
        or endorsed by {company.name}; its name and logo belong to {company.name}. Each attempt picks a different mix of topics.
      </p>
      <ErrorToast message={error} />
    </div>
  )
}
