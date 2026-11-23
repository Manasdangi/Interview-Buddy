import { useCallback, useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import '../../styles/atlas.css'

export type SideItem = { key: string; name: string; count: number }

type AtlasShellProps = {
  title: ReactNode
  lede: ReactNode
  sideTitle: string
  items: SideItem[]
  tools: ReactNode
  children: ReactNode
}

/** Atlas page frame: intro, sticky search/filter bar, left sidebar with scroll-spy, content column.
 *  Sections inside children must carry id="sec-<key>" and data-sec="<key>". */
export function AtlasShell({ title, lede, sideTitle, items, tools, children }: AtlasShellProps) {
  const toolsRef = useRef<HTMLDivElement>(null)
  const [heights, setHeights] = useState({ hdr: 73, tools: 104 })
  const [active, setActive] = useState<string | null>(null)

  // Keep the sticky offsets in sync with the real header / tools height (they wrap on phones).
  useLayoutEffect(() => {
    const header = document.querySelector('header')
    const measure = () => setHeights({ hdr: header?.getBoundingClientRect().height ?? 73, tools: toolsRef.current?.getBoundingClientRect().height ?? 104 })
    measure()
    const ro = new ResizeObserver(measure)
    if (header) ro.observe(header)
    if (toolsRef.current) ro.observe(toolsRef.current)
    return () => ro.disconnect()
  }, [])

  const spy = useCallback(() => {
    const line = heights.hdr + heights.tools + 80
    let current: string | null = null
    document.querySelectorAll<HTMLElement>('.atlas [data-sec]').forEach((section) => {
      if (section.getBoundingClientRect().top <= line) current = section.dataset.sec ?? null
    })
    setActive(current ?? document.querySelector<HTMLElement>('.atlas [data-sec]')?.dataset.sec ?? null)
  }, [heights])

  useEffect(() => {
    const first = window.requestAnimationFrame(spy) // after layout, once the sections exist
    window.addEventListener('scroll', spy, { passive: true })
    return () => {
      window.cancelAnimationFrame(first)
      window.removeEventListener('scroll', spy)
    }
  }, [spy, items])

  // Keep the active sidebar entry visible inside the sidebar (horizontal strip on phones).
  useEffect(() => {
    if (!active) return
    document.querySelector(`.atlas .side-link[data-key="${CSS.escape(active)}"]`)?.scrollIntoView({ block: 'nearest', inline: 'nearest' })
  }, [active])

  const jump = (key: string) => document.getElementById(`sec-${key}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })

  const style = { '--hdr': `${heights.hdr}px`, '--tools-h': `${heights.tools}px` } as CSSProperties

  return (
    <div className="atlas" style={style}>
      <div className="col2">
        <div aria-hidden="true" />
        <div className="top content">
          <h1>{title}</h1>
          <p className="lede">{lede}</p>
        </div>
      </div>

      <div className="tools" ref={toolsRef}>
        <div className="col2">
          <div aria-hidden="true" />
          <div className="tools-main">{tools}</div>
        </div>
      </div>

      <div className="col2">
        <aside className="side" aria-label={sideTitle}>
          <p className="side-title">{sideTitle}</p>
          <nav className="side-list">
            {items.map((item, index) => (
              <button
                key={item.key}
                type="button"
                data-key={item.key}
                className={`side-link${active === item.key ? ' active' : ''}`}
                aria-current={active === item.key ? 'true' : undefined}
                onClick={() => jump(item.key)}
              >
                <span className="side-no">{String(index + 1).padStart(2, '0')}</span>
                <span>{item.name}</span>
                <span className="side-count">{item.count}</span>
              </button>
            ))}
          </nav>
        </aside>
        <div className="content" style={{ paddingBottom: 60 }}>
          {children}
        </div>
      </div>
    </div>
  )
}
