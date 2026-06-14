import { Link } from 'react-router-dom'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'

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
            Practice frontend interviews for Round 1, Round 2, and System Design with a responsive AI interviewer that asks one question at a time.
          </p>
          <div className="mt-8">
            <Link to="/select-interview">
              <Button>Start Practice</Button>
            </Link>
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
