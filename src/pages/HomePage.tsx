import { Link } from 'react-router-dom'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { companies, findCompany } from '../../shared/companyCatalog'
import { CompanyMonogram } from '../components/company/CompanyMonogram'

const popularCompanyIds = ['openai', 'anthropic', 'google', 'amazon', 'microsoft', 'flipkart', 'atlassian', 'phonepe']

const cards = [
  {
    title: 'Round 1',
    description: 'JavaScript, React, HTML/CSS basics for frontend fundamentals.',
    color: 'ring-indigo-500/40',
  },
  {
    title: 'Round 2',
    description: 'Machine coding and advanced React with performance reasoning.',
    color: 'ring-fuchsia-500/40',
  },
  {
    title: 'System Design',
    description: 'Frontend architecture, scalability and design discussions.',
    color: 'ring-cyan-500/40',
  },
]

export default function HomePage() {
  return (
    <div className="space-y-10">
      <section className="rounded-[2rem] border border-slate-800/80 bg-slate-950/90 p-10 shadow-soft">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-indigo-300">Interview Buddy</p>
          <h1 className="mt-6 text-5xl font-semibold text-white sm:text-6xl">Practice frontend interviews with an AI interviewer.</h1>
          <p className="mt-5 max-w-2xl text-slate-400">
            Pick a company and role — OpenAI, Amazon, Flipkart, Atlassian and 100+ more — and take a mock round modelled on how that company's
            frontend interviews are commonly reported to run. Timed, adaptive follow-ups, voice mode, code editor and a detailed report. Free.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/companies">
              <Button>Company mock interviews</Button>
            </Link>
            <Link to="/select-interview">
              <Button variant="secondary">General practice</Button>
            </Link>
          </div>
          <div className="mt-8">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Popular this week</p>
            <ul className="mt-3 flex flex-wrap gap-2">
              {popularCompanyIds.map((id) => {
                const company = findCompany(id)
                if (!company) return null
                return (
                  <li key={id}>
                    <Link
                      to={`/companies/${id}`}
                      className="flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900 py-1.5 pl-1.5 pr-4 text-sm text-slate-200 transition hover:border-indigo-400/60 hover:text-white"
                    >
                      <span className="scale-[0.72] -m-1.5">
                        <CompanyMonogram companyId={id} name={company.name} />
                      </span>
                      {company.name}
                    </Link>
                  </li>
                )
              })}
              <li>
                <Link to="/companies" className="flex h-full items-center rounded-full px-3 py-1.5 text-sm font-medium text-indigo-300 hover:text-indigo-200">
                  All {companies.length}+ companies →
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        {cards.map((card) => (
          <Card key={card.title} className={`border-slate-800/80 ring-1 ${card.color}`}>
            <div className="flex h-12 w-12 items-center justify-center rounded-3xl bg-slate-900 text-white">
              {card.title === 'Round 1' ? '1' : card.title === 'Round 2' ? '2' : 'S'}
            </div>
            <h2 className="mt-6 text-xl font-semibold text-white">{card.title}</h2>
            <p className="mt-3 text-slate-400">{card.description}</p>
          </Card>
        ))}
      </section>
    </div>
  )
}
