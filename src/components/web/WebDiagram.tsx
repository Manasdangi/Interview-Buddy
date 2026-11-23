import { Fragment, type ReactElement } from 'react'

export type Tone = 'indigo' | 'emerald' | 'amber' | 'rose' | 'cyan' | 'fuchsia' | 'slate'

type Box = { label: string; note?: string; tone?: Tone }

/** Small, data-driven pictures: each question picks the shape that matches how the idea works.
 *  Styled by the .wd-* rules in styles/atlas.css (tones map to the atlas palette). */
export type Diagram =
  /** steps that happen one after another */
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

const tone = (t?: Tone) => `wd-tone-${t ?? 'slate'}`

function Card({ box }: { box: Box }) {
  return (
    <div className={`wd-box ${tone(box.tone)}`}>
      <p className="wd-label">{box.label}</p>
      {box.note ? <p className="wd-note">{box.note}</p> : null}
    </div>
  )
}

function Column({ title, items, t }: { title: string; items: string[]; t?: Tone }) {
  return (
    <div className={`wd-box ${tone(t)}`}>
      <p className="wd-title">{title}</p>
      <ul className="wd-list">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  )
}

function Nest({ layers, index = 0 }: { layers: Box[]; index?: number }): ReactElement | null {
  const layer = layers[index]
  if (!layer) return null
  return (
    <div className={`wd-nest ${tone(layer.tone)}`}>
      <p className="wd-nest-label">
        {layer.label}
        {layer.note ? <span>{layer.note}</span> : null}
      </p>
      {index < layers.length - 1 ? <Nest layers={layers} index={index + 1} /> : null}
    </div>
  )
}

function body(diagram: Diagram): ReactElement {
  switch (diagram.kind) {
    case 'flow':
      return (
        <div className="wd-flow">
          {diagram.steps.map((step, index) => (
            <Fragment key={step.label + index}>
              {index > 0 ? (
                <span className="wd-arrow" aria-hidden="true">
                  →
                </span>
              ) : null}
              <Card box={step} />
            </Fragment>
          ))}
        </div>
      )
    case 'nest':
      return <Nest layers={diagram.layers} />
    case 'compare':
      return (
        <div className="wd-cols">
          <Column title={diagram.left.title} items={diagram.left.items} t={diagram.left.tone ?? 'indigo'} />
          <Column title={diagram.right.title} items={diagram.right.items} t={diagram.right.tone ?? 'emerald'} />
        </div>
      )
    case 'lanes':
      return (
        <div className="wd-cols">
          {diagram.lanes.map((lane) => (
            <Column key={lane.title} title={lane.title} items={lane.items} t={lane.tone} />
          ))}
        </div>
      )
    case 'ladder':
      return (
        <ol className="wd-ladder">
          {diagram.rungs.map((rung, index) => (
            <li key={rung.label}>
              <span className="wd-rank">{index + 1}</span>
              <Card box={rung} />
            </li>
          ))}
        </ol>
      )
    case 'timeline':
      return (
        <div className="wd-time">
          {diagram.rows.map((row) => (
            <div key={row.title} className="wd-trow">
              <span>{row.title}</span>
              <div className="wd-track">
                {row.segs.map((seg) => (
                  <div
                    key={seg.label + seg.from}
                    className={`wd-seg ${tone(seg.tone)}`}
                    style={{ left: `${(seg.from / diagram.max) * 100}%`, width: `${((seg.to - seg.from) / diagram.max) * 100}%` }}
                    title={seg.label}
                  >
                    {seg.label}
                  </div>
                ))}
              </div>
            </div>
          ))}
          <div className="wd-axis">
            <span>start</span>
            <span>time →</span>
          </div>
        </div>
      )
    case 'table':
      return (
        <div className="wd-table-wrap">
          <table className="wd-table">
            <thead>
              <tr>
                {diagram.head.map((cell, index) => (
                  <th key={cell + index}>{cell}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {diagram.rows.map((row) => (
                <tr key={row.join('|')}>
                  {row.map((cell, index) => (
                    <td key={index}>{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )
  }
}

export function WebDiagram({ diagram }: { diagram: Diagram }) {
  return (
    <figure className="viz wd" aria-label="Illustration">
      {body(diagram)}
    </figure>
  )
}
