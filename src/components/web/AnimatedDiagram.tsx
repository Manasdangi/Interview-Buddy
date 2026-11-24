import { Fragment, useCallback, useEffect, useRef, useState, type ReactElement } from 'react'
import type { Diagram, Tone } from './WebDiagram'

/**
 * Plays a diagram as a short animation, one "beat" at a time, with a caption that narrates each beat.
 * Every diagram kind has its own motion:
 *  flow     – a glowing packet travels the arrow, then the next step lights up
 *  nest     – zooms in layer by layer, from the outer box to the inner one
 *  compare  – items pop in on alternate sides, ✗ on the "problem" side, ✓ on the "fix" side
 *  lanes    – tasks drop into their lane in run order, each stamped with its order number
 *  ladder   – rungs light up from the top, the winner gets a crown
 *  timeline – a playhead sweeps the time axis and bars grow as it passes
 *  table    – a scanner moves down the rows
 * Plays when the card is on screen, loops, and stays still (fully drawn) for prefers-reduced-motion.
 */

const BEAT_MS = 1500
const HOLD_BEATS = 1.6 // pause on the finished picture before looping

const tone = (t?: Tone) => `wd-tone-${t ?? 'slate'}`
const BAD = new Set(['rose', 'amber'])

type Plan = { count: number; captions: string[] }

function planFor(d: Diagram): Plan {
  switch (d.kind) {
    case 'flow':
      return { count: d.steps.length, captions: d.steps.map((s) => s.label + (s.note ? ` — ${s.note}` : '')) }
    case 'nest':
      return { count: d.layers.length, captions: d.layers.map((l, i) => `${i === 0 ? 'Outside' : 'Inside it'}: ${l.label}${l.note ? ` — ${l.note}` : ''}`) }
    case 'compare': {
      const order = compareOrder(d)
      return { count: order.length, captions: order.map(([side, i]) => `${d[side].title}: ${d[side].items[i]}`) }
    }
    case 'lanes': {
      const order = lanesOrder(d)
      return { count: order.length, captions: order.map(([lane, i]) => `${d.lanes[lane].title} → ${d.lanes[lane].items[i]}`) }
    }
    case 'ladder':
      return {
        count: d.rungs.length + 1,
        captions: [...d.rungs.map((r, i) => `#${i + 1} ${r.label}${r.note ? ` — ${r.note}` : ''}`), `Highest rung wins: ${d.rungs[0]?.label ?? ''}`],
      }
    case 'timeline': {
      const segs = timelineSegs(d)
      return { count: Math.max(segs.length, 1), captions: segs.map((s) => `${s.row}: ${s.label}`) }
    }
    case 'table':
      return { count: d.rows.length, captions: d.rows.map((r) => r.join('  ·  ')) }
  }
}

type CompareD = Extract<Diagram, { kind: 'compare' }>
type LanesD = Extract<Diagram, { kind: 'lanes' }>
type TimelineD = Extract<Diagram, { kind: 'timeline' }>

function compareOrder(d: CompareD): Array<['left' | 'right', number]> {
  const out: Array<['left' | 'right', number]> = []
  const n = Math.max(d.left.items.length, d.right.items.length)
  for (let i = 0; i < n; i++) {
    if (i < d.left.items.length) out.push(['left', i])
    if (i < d.right.items.length) out.push(['right', i])
  }
  return out
}

/** Lane by lane: sync → microtasks → macrotasks is also the order things run. */
function lanesOrder(d: LanesD): Array<[number, number]> {
  return d.lanes.flatMap((lane, l) => lane.items.map((_, i) => [l, i] as [number, number]))
}

function timelineSegs(d: TimelineD) {
  return d.rows
    .flatMap((row) => row.segs.map((s) => ({ ...s, row: row.title })))
    .sort((a, b) => a.from - b.from || a.to - b.to)
}

function prefersReducedMotion() {
  return typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
}

/** A clock in beats that runs only while playing AND on screen. */
function usePlayer(count: number) {
  const ref = useRef<HTMLElement>(null)
  const [t, setT] = useState(() => (prefersReducedMotion() ? count : 0))
  const [playing, setPlaying] = useState(() => !prefersReducedMotion())
  const [visible, setVisible] = useState(false)
  const playingRef = useRef(playing)
  useEffect(() => {
    playingRef.current = playing
  }, [playing])

  // Each time the figure scrolls into focus it starts again from the first step.
  useEffect(() => {
    const el = ref.current
    if (!el || typeof IntersectionObserver === 'undefined') return
    const io = new IntersectionObserver(
      ([entry]) => {
        setVisible(entry.isIntersecting)
        if (entry.isIntersecting && playingRef.current && !prefersReducedMotion()) setT(0)
      },
      { threshold: 0.4 },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  useEffect(() => {
    if (!playing || !visible) return
    let raf = 0
    let last = performance.now()
    const tick = (now: number) => {
      const dt = Math.min(now - last, 100)
      last = now
      setT((prev) => {
        const next = prev + dt / BEAT_MS
        return next >= count + HOLD_BEATS ? 0 : next
      })
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [playing, visible, count])

  const toggle = useCallback(() => setPlaying((p) => !p), [])
  const replay = useCallback(() => {
    setT(0)
    setPlaying(true)
  }, [])
  const seek = useCallback((beat: number) => {
    setT(beat + 0.999)
    setPlaying(false)
  }, [])

  return { ref, t, playing, toggle, replay, seek }
}

/* ---------- per-kind scenes ---------- */

function FlowScene({ d, beat, frac }: { d: Extract<Diagram, { kind: 'flow' }>; beat: number; frac: number }) {
  return (
    <div className="wd-flow">
      {d.steps.map((step, i) => (
        <Fragment key={step.label + i}>
          {i > 0 ? (
            <span className={`wd-arrow wa-arrow ${i === beat && frac < 0.45 ? 'is-live' : ''} ${i <= beat ? 'is-done' : ''}`} aria-hidden="true">
              <span className="wa-line" />
              <span className="wa-dot" />
            </span>
          ) : null}
          <div className={`wd-box ${tone(step.tone)} wa-item ${i > beat ? 'is-hidden' : ''} ${i === beat ? 'is-active' : ''}`}>
            <span className="wa-num">{i + 1}</span>
            <p className="wd-label">{step.label}</p>
            {step.note ? <p className="wd-note">{step.note}</p> : null}
          </div>
        </Fragment>
      ))}
    </div>
  )
}

function NestScene({ d, beat }: { d: Extract<Diagram, { kind: 'nest' }>; beat: number }) {
  const render = (i: number): ReactElement | null => {
    const layer = d.layers[i]
    if (!layer) return null
    return (
      <div className={`wd-nest ${tone(layer.tone)} wa-nest ${i > beat ? 'is-hidden' : ''} ${i === beat ? 'is-active' : ''}`}>
        <p className="wd-nest-label">
          {layer.label}
          {layer.note ? <span>{layer.note}</span> : null}
        </p>
        {render(i + 1)}
      </div>
    )
  }
  return render(0) ?? <></>
}

function CompareScene({ d, beat }: { d: CompareD; beat: number }) {
  const order = compareOrder(d)
  const shownAt = (side: 'left' | 'right', i: number) => order.findIndex(([s, k]) => s === side && k === i)
  const col = (side: 'left' | 'right', fallback: Tone) => {
    const c = d[side]
    const t = c.tone ?? fallback
    const mark = BAD.has(t) ? '✗' : t === 'emerald' ? '✓' : '•'
    const lastBeat = order.length - 1
    return (
      <div className={`wd-box ${tone(t)} wa-col ${beat >= lastBeat ? 'is-settled' : ''}`}>
        <p className="wd-title">{c.title}</p>
        <ul className="wd-list wa-list">
          {c.items.map((item, i) => {
            const at = shownAt(side, i)
            return (
              <li key={item} className={`wa-li ${at > beat ? 'is-hidden' : ''} ${at === beat ? 'is-new' : ''}`} data-mark={mark}>
                {item}
              </li>
            )
          })}
        </ul>
      </div>
    )
  }
  return (
    <div className="wd-cols wa-compare">
      {col('left', 'indigo')}
      <span className="wa-vs" aria-hidden="true">
        VS
      </span>
      {col('right', 'emerald')}
    </div>
  )
}

function LanesScene({ d, beat }: { d: LanesD; beat: number }) {
  const order = lanesOrder(d)
  const activeLane = order[Math.min(beat, order.length - 1)]?.[0] ?? 0
  return (
    <div className="wd-cols wa-lanes">
      {d.lanes.map((lane, l) => (
        <div key={lane.title} className={`wd-box ${tone(lane.tone)} wa-lane ${l === activeLane && beat < order.length ? 'is-active' : ''}`}>
          <p className="wd-title">{lane.title}</p>
          <ul className="wd-list wa-list">
            {lane.items.map((item, i) => {
              const at = order.findIndex(([ll, k]) => ll === l && k === i)
              return (
                <li key={item} className={`wa-li wa-drop ${at > beat ? 'is-hidden' : ''} ${at === beat ? 'is-new' : ''}`}>
                  <span className="wa-ord">{at + 1}</span>
                  {item}
                </li>
              )
            })}
          </ul>
        </div>
      ))}
    </div>
  )
}

function LadderScene({ d, beat }: { d: Extract<Diagram, { kind: 'ladder' }>; beat: number }) {
  const crowned = beat >= d.rungs.length
  return (
    <ol className="wd-ladder">
      {d.rungs.map((rung, i) => (
        <li key={rung.label} className={`wa-item ${i > beat ? 'is-hidden' : ''} ${i === beat ? 'is-active' : ''} ${crowned && i === 0 ? 'is-winner' : ''}`}>
          <span className="wd-rank">{crowned && i === 0 ? '👑' : i + 1}</span>
          <div className={`wd-box ${tone(rung.tone)}`}>
            <p className="wd-label">{rung.label}</p>
            {rung.note ? <p className="wd-note">{rung.note}</p> : null}
          </div>
        </li>
      ))}
    </ol>
  )
}

function TimelineScene({ d, t, count }: { d: TimelineD; t: number; count: number }) {
  const now = Math.min(t / count, 1) * d.max
  return (
    <div className="wd-time wa-time">
      {d.rows.map((row) => (
        <div key={row.title} className="wd-trow">
          <span>{row.title}</span>
          <div className="wd-track">
            {row.segs.map((seg) => {
              const grown = Math.max(0, Math.min(1, (now - seg.from) / Math.max(seg.to - seg.from, 0.0001)))
              const live = now >= seg.from && now < seg.to
              return (
                <div
                  key={seg.label + seg.from}
                  className={`wd-seg ${tone(seg.tone)} wa-seg ${live ? 'is-live' : ''}`}
                  style={{
                    left: `${(seg.from / d.max) * 100}%`,
                    width: `${((seg.to - seg.from) / d.max) * 100}%`,
                    clipPath: `inset(0 ${(1 - grown) * 100}% 0 0 round 6px)`,
                  }}
                  title={seg.label}
                >
                  {seg.label}
                </div>
              )
            })}
            <span className="wa-head" style={{ left: `${(now / d.max) * 100}%` }} aria-hidden="true" />
          </div>
        </div>
      ))}
      <div className="wd-axis">
        <span>start</span>
        <span>time →</span>
      </div>
    </div>
  )
}

function TableScene({ d, beat }: { d: Extract<Diagram, { kind: 'table' }>; beat: number }) {
  return (
    <div className="wd-table-wrap">
      <table className="wd-table wa-table">
        <thead>
          <tr>
            {d.head.map((cell, i) => (
              <th key={cell + i}>{cell}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {d.rows.map((row, r) => (
            <tr key={row.join('|')} className={`${r > beat ? 'is-hidden' : ''} ${r === beat ? 'is-active' : ''}`}>
              {row.map((cell, i) => (
                <td key={i}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function AnimatedDiagram({ diagram }: { diagram: Diagram }) {
  const plan = planFor(diagram)
  const { ref, t, playing, toggle, replay, seek } = usePlayer(plan.count)
  const beat = Math.min(Math.floor(t), plan.count - 1)
  const frac = t - Math.floor(t)
  const done = t >= plan.count

  let scene: ReactElement
  switch (diagram.kind) {
    case 'flow':
      scene = <FlowScene d={diagram} beat={beat} frac={done ? 1 : frac} />
      break
    case 'nest':
      scene = <NestScene d={diagram} beat={beat} />
      break
    case 'compare':
      scene = <CompareScene d={diagram} beat={beat} />
      break
    case 'lanes':
      scene = <LanesScene d={diagram} beat={beat} />
      break
    case 'ladder':
      scene = <LadderScene d={diagram} beat={beat} />
      break
    case 'timeline':
      scene = <TimelineScene d={diagram} t={t} count={plan.count} />
      break
    case 'table':
      scene = <TableScene d={diagram} beat={beat} />
      break
  }

  let caption = done && diagram.kind !== 'ladder' ? 'Done — replay or tap a step to look again.' : plan.captions[beat]
  if (diagram.kind === 'timeline' && !done) {
    const now = Math.min(t / plan.count, 1) * diagram.max
    const segs = timelineSegs(diagram).filter((s) => s.from <= now)
    const seg = segs[segs.length - 1]
    caption = seg ? `${seg.row}: ${seg.label}` : 'Time starts…'
  }
  return (
    <figure ref={ref} className={`viz wd wa wa-${diagram.kind}`} aria-label="Animated illustration">
      <div className="wa-stage">{scene}</div>
      <div className="wa-ctrl">
        <button type="button" className="wa-btn" onClick={toggle} aria-label={playing ? 'Pause animation' : 'Play animation'}>
          {playing ? '❚❚' : '▶'}
        </button>
        <button type="button" className="wa-btn" onClick={replay} aria-label="Replay animation">
          ↺
        </button>
        <div className="wa-steps" role="group" aria-label="Steps">
          {Array.from({ length: plan.count }, (_, i) => (
            <button
              key={i}
              type="button"
              className={`wa-pip ${i < beat || done ? 'is-done' : ''} ${i === beat && !done ? 'is-now' : ''}`}
              onClick={() => seek(i)}
              aria-label={`Step ${i + 1}`}
            />
          ))}
        </div>
        <span className="wa-count">
          {Math.min(beat + 1, plan.count)}/{plan.count}
        </span>
      </div>
      <p className="wa-cap">
        <b>{done && diagram.kind !== 'ladder' ? '✓' : `Step ${beat + 1}`}</b> {caption}
      </p>
    </figure>
  )
}
