import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Search } from 'lucide-react'
import { companies, companyCategoryLabels, type CompanyCategory } from '../../shared/companyCatalog'
import { Input } from '../components/ui/Input'
import { CompanyMonogram } from '../components/company/CompanyMonogram'
import { cn } from '../utils/cn'

const categories: Array<CompanyCategory | 'ALL'> = ['ALL', 'AI', 'BIG_TECH', 'INDIAN_PRODUCT', 'FINTECH', 'SAAS_ENTERPRISE', 'STARTUP']

export default function CompaniesPage() {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<CompanyCategory | 'ALL'>('ALL')

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase()
    return companies.filter(
      (company) =>
        (category === 'ALL' || company.category === category) &&
        (!needle || company.name.toLowerCase().includes(needle) || company.tagline.toLowerCase().includes(needle)),
    )
  }, [query, category])

  return (
    <div className="space-y-8">
      <div className="rounded-[2rem] border border-slate-800/80 bg-slate-950/90 p-8 shadow-soft">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-indigo-300">Company mock interviews</p>
        <h1 className="mt-4 text-4xl font-semibold text-white">Pick the company you're interviewing with</h1>
        <p className="mt-3 max-w-2xl text-slate-400">
          Each mock round follows the format, focus areas and interviewer style candidates commonly report for that company's frontend loop.
          Free to practise.
        </p>

        <div className="mt-6 flex flex-col gap-4 lg:flex-row lg:items-center">
          <label className="relative block lg:w-80">
            <span className="sr-only">Search companies</span>
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" aria-hidden="true" />
            <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search Amazon, Flipkart…" className="pl-10" />
          </label>
          <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Company category">
            {categories.map((item) => (
              <button
                key={item}
                type="button"
                role="radio"
                aria-checked={category === item}
                onClick={() => setCategory(item)}
                className={cn(
                  'rounded-full border px-4 py-2 text-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
                  category === item ? 'border-indigo-300 bg-indigo-950/60 text-white' : 'border-slate-700 text-slate-400 hover:border-slate-500 hover:text-slate-200',
                )}
              >
                {item === 'ALL' ? 'All' : companyCategoryLabels[item]}
              </button>
            ))}
          </div>
        </div>
      </div>

      {visible.length ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {visible.map((company) => (
            <Link
              key={company.id}
              to={`/companies/${company.id}`}
              className="group flex flex-col rounded-3xl border border-slate-800/80 bg-slate-950/90 p-5 shadow-soft transition hover:border-indigo-400/60 hover:bg-slate-900/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <div className="flex items-center gap-3">
                <CompanyMonogram companyId={company.id} name={company.name} />
                <div>
                  <h2 className="text-lg font-semibold text-white">{company.name}</h2>
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-500">{companyCategoryLabels[company.category]}</p>
                </div>
              </div>
              <p className="mt-4 flex-1 text-sm leading-6 text-slate-400">{company.tagline}</p>
              <p className="mt-4 text-sm font-medium text-indigo-300 group-hover:text-indigo-200">{company.rounds.length} rounds →</p>
            </Link>
          ))}
        </div>
      ) : (
        <p className="rounded-3xl border border-slate-800/80 bg-slate-950/90 p-8 text-center text-slate-400">
          No companies match “{query}”. More companies are being added.
        </p>
      )}

      <p className="text-xs text-slate-500">
        Company names and logos are trademarks of their respective owners and are used only to identify the company a practice round is modelled on. Interview Buddy is not affiliated with or endorsed by these companies, and
        questions are original practice questions, not real or leaked interview questions.
      </p>
    </div>
  )
}
