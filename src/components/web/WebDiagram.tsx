import { Fragment, type ReactElement } from 'react'
import { ArrowDown, ArrowRight } from 'lucide-react'
import { cn } from '../../utils/cn'

export type Tone = 'indigo' | 'emerald' | 'amber' | 'rose' | 'cyan' | 'fuchsia' | 'slate'

type Box = { label: string; note?: string; tone?: Tone }

/** Small, data-driven pictures: each question picks the shape that matches how the idea works. */
export type Diagram =
  /** steps that happen one after another (left → right, wraps on phones) */
  | { kind: 'flow'; steps: Box[] }
  /** boxes inside boxes, outermost first (box model, DOM nesting, scopes) */
  | { kind: 'nest'; layers: Box[] }
  /** two things side by side */
  | { kind: 'compare'; left: { title: string; tone?: Tone; items: string[] }; right: { title: string; tone?: Tone; items: string[] } }
  /** parallel columns, e.g. call stack · microtasks · macrotasks */
  | { kind: 'lanes'; lanes: { title: string; tone?: Tone; items: string[] }[] }
  /** ordered list where the top rung wins (specificity, `this` rules) */
  | { kind: 'ladder'; rungs: Box[] }
  /** bars on a shared time axis (async vs defer, debounce vs throttle) */
  | { kind: 'timeline'; max: number; rows: { title: string; segs: { from: number; to: number; label: string; tone?: Tone }[] }[] }
  /** a plain grid of facts */
  | { kind: 'table'; head: string[]; rows: string[][] }

const TONE: Record<Tone, { box: string; text: string; bar: string }> = {
  indigo: { box: 'border-indigo-400/60 bg-indigo-500/10', text: 'text-indigo-300', bar: 'bg-indigo-500/70' },
  emerald: { box: 'border-emerald-400/60 bg-emerald-500/10', text: 'text-emerald-300', bar: 'bg-emerald-500/70' },
  amber: { box: 'border-amber-400/60 bg-amber-500/10', text: 'text-amber-300', bar: 'bg-amber-500/70' },
  rose: { box: 'border-rose-400/60 bg-rose-500/10', text: 'text-rose-300', bar: 'bg-rose-500/70' },
  cyan: { box: 'border-cyan-400/60 bg-cyan-500/10', text: 'text-cyan-300', bar: 'bg-cyan-500/70' },
  fuchsia: { box: 'border-fuchsia-400/60 bg-fuchsia-500/10', text: 'text-fuchsia-300', bar: 'bg-fuchsia-500/70' },
  slate: { box: 'border-slate-600 bg-slate-800/60', text: 'text-slate-300', bar: 'bg-slate-500/70' },
}

const tone = (t?: Tone) => TONE[t ?? 'slate']

function Card({ box, className }: { box: Box; className?: string }) {
  return (
    <div className={cn('rounded-2xl border px-3 py-2', tone(box.tone).box, className)}>
      <p className={cn('text-sm font-semibold', tone(box.tone).text)}>{box.label}</p>
      {box.note ? <p className="mt-0.5 text-xs leading-5 text-slate-400">{box.note}</p> : null}
    </div>
  )
}

function Flow({ steps }: { steps: Box[] }) {
  return (
    <div className="flex flex-col items-stretch gap-2 sm:flex-row sm:flex-wrap sm:items-center">
      {steps.map((step, index) => (
        <Fragment key={step.label + index}>
          <Card box={step} className="sm:min-w-[8rem] sm:flex-1" />
          {index < steps.length - 1 ? (
            <>
              <ArrowRight className="hidden h-4 w-4 shrink-0 self-center text-slate-500 sm:block" aria-hidden="true" />
              <ArrowDown className="h-4 w-4 shrink-0 self-center text-slate-500 sm:hidden" aria-hidden="true" />
            </>
          ) : null}
        </Fragment>
      ))}
    </div>
  )
}

function Nest({ layers }: { layers: Box[] }) {
  const render = (index: number): ReactElement | null => {
    const layer = layers[index]
    if (!layer) return null
    return (
      <div className={cn('rounded-2xl border border-dashed p-3', tone(layer.tone).box)}>
        <p className={cn('text-xs font-semibold uppercase tracking-wide', tone(layer.tone).text)}>
          {layer.label}
          {layer.note ? <span className="ml-2 font-normal normal-case tracking-normal text-slate-400">{layer.note}</span> : null}
        </p>
        {index < layers.length - 1 ? <div className="mt-2">{render(index + 1)}</div> : null}
      </div>
    )
  }
  return render(0)
}

function Column({ title, items, t }: { title: string; items: string[]; t?: Tone }) {
  return (
    <div className={cn('rounded-2xl border p-3', tone(t).box)}>
      <p className={cn('text-sm font-semibold', tone(t).text)}>{title}</p>
      <ul className="mt-2 space-y-1 text-sm text-slate-300">
        {items.map((item) => (
          <li key={item} className="flex gap-2">
            <span className={cn('mt-2 h-1.5 w-1.5 shrink-0 rounded-full', tone(t).bar)} aria-hidden="true" />
            <span className="font-mono text-[13px] leading-6">{item}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

function Ladder({ rungs }: { rungs: Box[] }) {
  return (
    <ol className="space-y-2">
      {rungs.map((rung, index) => (
        <li key={rung.label} className="flex items-stretch gap-3">
          <span className="flex w-8 shrink-0 items-center justify-center rounded-xl bg-slate-800 font-mono text-xs text-slate-300">{index + 1}</span>
          <Card box={rung} className="flex-1" />
        </li>
      ))}
    </ol>
  )
}

function Timeline({ max, rows }: { max: number; rows: { title: string; segs: { from: number; to: number; label: string; tone?: Tone }[] }[] }) {
  return (
    <div className="space-y-3">
      {rows.map((row) => (
        <div key={row.title} className="grid grid-cols-[6.5rem_1fr] items-center gap-3 sm:grid-cols-[9rem_1fr]">
          <p className="text-xs font-semibold text-slate-300">{row.title}</p>
          <div className="relative h-8 rounded-xl bg-slate-800/60">
            {row.segs.map((seg) => (
              <div
                key={seg.label + seg.from}
                className={cn('absolute top-1 flex h-6 items-center overflow-hidden rounded-lg px-1.5 text-[11px] font-semibold text-pure', tone(seg.tone).bar)}
                style={{ left: `${(seg.from / max) * 100}%`, width: `${((seg.to - seg.from) / max) * 100}%` }}
                title={seg.label}
              >
                <span className="truncate">{seg.label}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
      <div className="grid grid-cols-[6.5rem_1fr] gap-3 sm:grid-cols-[9rem_1fr]">
        <span />
        <div className="flex justify-between text-[10px] uppercase tracking-wider text-slate-500">
          <span>start</span>
          <span>time →</span>
        </div>
      </div>
    </div>
  )
}

function Table({ head, rows }: { head: string[]; rows: string[][] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[28rem] border-separate border-spacing-0 text-left text-sm">
        <thead>
          <tr>
            {head.map((cell) => (
              <th key={cell} className="border-b border-slate-700 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-indigo-300">
                {cell}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.join('|')}>
              {row.map((cell, index) => (
                <td key={index} className={cn('border-b border-slate-800 px-3 py-2 text-slate-300', index === 0 && 'font-mono text-[13px] text-white')}>
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function WebDiagram({ diagram }: { diagram: Diagram }) {
  let body: ReactElement
  switch (diagram.kind) {
    case 'flow':
      body = <Flow steps={diagram.steps} />
      break
    case 'nest':
      body = <Nest layers={diagram.layers} />
      break
    case 'compare':
      body = (
        <div className="grid gap-3 sm:grid-cols-2">
          <Column title={diagram.left.title} items={diagram.left.items} t={diagram.left.tone ?? 'indigo'} />
          <Column title={diagram.right.title} items={diagram.right.items} t={diagram.right.tone ?? 'emerald'} />
        </div>
      )
      break
    case 'lanes':
      body = (
        <div className={cn('grid gap-3', diagram.lanes.length >= 3 ? 'sm:grid-cols-3' : 'sm:grid-cols-2')}>
          {diagram.lanes.map((lane) => (
            <Column key={lane.title} title={lane.title} items={lane.items} t={lane.tone} />
          ))}
        </div>
      )
      break
    case 'ladder':
      body = <Ladder rungs={diagram.rungs} />
      break
    case 'timeline':
      body = <Timeline max={diagram.max} rows={diagram.rows} />
      break
    case 'table':
      body = <Table head={diagram.head} rows={diagram.rows} />
      break
  }
  return (
    <figure className="rounded-3xl border border-dashed border-slate-700 bg-slate-900/40 p-4" aria-label="Illustration">
      {body}
    </figure>
  )
}
