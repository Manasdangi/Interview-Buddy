import { Link } from 'react-router-dom'
import { Card } from '../components/ui/Card'

const options = [
  { label: 'Round 1', value: 'ROUND_1', description: 'JavaScript, React, HTML/CSS basics' },
  { label: 'Round 2', value: 'ROUND_2', description: 'Machine coding, advanced React, performance' },
  { label: 'System Design', value: 'SYSTEM_DESIGN', description: 'Frontend architecture and scalability' },
]

export default function SelectInterviewPage() {
  return (
    <div className="space-y-8">
      <div className="rounded-[2rem] border border-slate-800/80 bg-slate-950/90 p-8 shadow-soft">
        <h1 className="text-4xl font-semibold text-white">Choose your interview track</h1>
        <p className="mt-3 text-slate-400">Select the interview type that matches the stage you want to practice.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {options.map((option) => (
          <Card key={option.value} className="group border-slate-800/80 hover:border-indigo-400/60">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-semibold text-white">{option.label}</h2>
                <p className="mt-3 text-slate-400">{option.description}</p>
              </div>
              <Link to={`/select-difficulty/${option.value}`} className="rounded-full bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800">
                Select
              </Link>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
