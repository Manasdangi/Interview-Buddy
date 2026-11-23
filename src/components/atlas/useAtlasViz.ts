import { useEffect, useState } from 'react'

/** The atlas's own SVG renderer (copied into public/atlas by `npm run sync:dsa`). */
export type AtlasViz = {
  render: (id: number, si: number, frame: number, def: number, playing?: boolean) => string
  allFrames: (id: number, si: number, def: number) => unknown[] | undefined
  setData: (problems: { id: number; title: string; sols: { label: string; time: string }[] }[]) => void
}

declare global {
  interface Window {
    VIZ?: AtlasViz
  }
}

const FILES = ['viz.js', 'viz-x.js', 'intuition.js', 'dry1.js', 'dry2.js', 'dry3.js', 'dry4.js']
let loading: Promise<AtlasViz> | null = null

function loadScript(src: string) {
  return new Promise<void>((resolve, reject) => {
    const el = document.createElement('script')
    el.src = src
    el.async = false // keep execution order: viz.js must run first
    el.onload = () => resolve()
    el.onerror = () => reject(new Error(`Could not load ${src}`))
    document.head.appendChild(el)
  })
}

function loadAtlasViz() {
  if (!loading) {
    loading = Promise.all(FILES.map((file) => loadScript(`/atlas/${file}`))).then(() => {
      if (!window.VIZ?.render) throw new Error('Atlas renderer missing')
      return window.VIZ
    })
    loading.catch(() => {
      loading = null
    })
  }
  return loading
}

/** Loads the renderer once and hands it back; null until it is ready (or if it failed). */
export function useAtlasViz(onReady?: (viz: AtlasViz) => void) {
  const [viz, setViz] = useState<AtlasViz | null>(() => window.VIZ?.render ? window.VIZ : null)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    let alive = true
    loadAtlasViz()
      .then((v) => {
        if (!alive) return
        onReady?.(v)
        setViz(v)
      })
      .catch(() => alive && setFailed(true))
    return () => {
      alive = false
    }
    // onReady is only meant to run once per load
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return { viz, failed }
}
