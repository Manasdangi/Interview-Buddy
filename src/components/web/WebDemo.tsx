import { useState } from 'react'

/** A live, sandboxed CSS playground: the real browser renders each variant, so you see the rule work. */
export type DemoVariant = {
  label: string
  /** CSS for this variant (also shown under the preview) */
  css: string
  /** overrides the demo's shared HTML */
  html?: string
  /** frame width in px, for viewport-dependent demos (media queries, clamp) */
  width?: number
  /** class on <html>, e.g. "dark" */
  htmlClass?: string
}

export type Demo = {
  /** what to look at / try, one short line */
  hint: string
  html: string
  /** CSS shared by every variant (not shown) */
  base?: string
  height?: number
  variants: DemoVariant[]
}

// Shared palette for every demo, in the atlas colours. Kept light so it reads the same in both themes.
const BASE = `*,*::before,*::after{box-sizing:border-box}
html,body{margin:0}
body{padding:12px;font:13px/1.45 -apple-system,BlinkMacSystemFont,'Segoe UI',system-ui,sans-serif;color:#1c2a39;background:#fcfcf9}
.box{padding:8px 10px;border-radius:6px;font-weight:600}
.t{background:#0b7f73;color:#fff}.y{background:#f0c04a;color:#1c2a39}.r{background:#e2685f;color:#fff}.bl{background:#3b6fd8;color:#fff}.g{background:#4fd68b;color:#1c2a39}
.frame{border:1.5px dashed #9aa8b6;border-radius:8px;padding:8px}
.lab{font:11px/1.3 ui-monospace,SFMono-Regular,Menlo,monospace;color:#5b6876}
.out{font:12px/1.3 ui-monospace,SFMono-Regular,Menlo,monospace;color:#0b7f73;margin-top:8px}
button{font:inherit}
`

export function WebDemo({ demo, title }: { demo: Demo; title: string }) {
  const [active, setActive] = useState(0)
  const variant = demo.variants[active]
  const doc = `<!doctype html><html class="${variant.htmlClass ?? ''}"><head><meta charset="utf-8"><style>${BASE}${demo.base ?? ''}\n${variant.css}</style></head><body>${variant.html ?? demo.html}</body></html>`

  return (
    <div className="demo">
      <div className="demo-head">
        <span className="demo-tag">Try it live</span>
        <span className="demo-hint">{demo.hint}</span>
      </div>
      {demo.variants.length > 1 ? (
        <div className="demo-tabs" role="group" aria-label="Variants">
          {demo.variants.map((v, index) => (
            <button key={v.label} type="button" className="chip" aria-pressed={active === index} onClick={() => setActive(index)}>
              {v.label}
            </button>
          ))}
        </div>
      ) : null}
      <div className="demo-stage">
        <iframe
          key={active}
          title={`${title} — ${variant.label}`}
          className="demo-frame"
          sandbox="allow-scripts"
          srcDoc={doc}
          style={{ height: demo.height ?? 170, width: variant.width ? `${variant.width}px` : '100%' }}
        />
        {variant.width ? <span className="demo-width">frame width: {variant.width}px</span> : null}
      </div>
      <pre className="demo-css">
        <code>{variant.css.trim()}</code>
      </pre>
    </div>
  )
}
