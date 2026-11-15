import { useState } from 'react'
import { companyDomains } from '../../../shared/companyCatalog'
import { cn } from '../../utils/cn'

const palettes = [
  'bg-indigo-500/20 text-indigo-200 ring-indigo-400/30',
  'bg-fuchsia-500/20 text-fuchsia-200 ring-fuchsia-400/30',
  'bg-cyan-500/20 text-cyan-200 ring-cyan-400/30',
  'bg-emerald-500/20 text-emerald-200 ring-emerald-400/30',
  'bg-amber-500/20 text-amber-200 ring-amber-400/30',
  'bg-rose-500/20 text-rose-200 ring-rose-400/30',
]

/** Logo sources in order of preference; a later one is tried when an earlier one fails or is low resolution. */
function logoSources(domain: string) {
  const encoded = encodeURIComponent(domain)
  return [`https://www.google.com/s2/favicons?domain=${encoded}&sz=128`, `https://icons.duckduckgo.com/ip3/${encoded}.ico`]
}

const minSharpWidth = 32

/**
 * The company's own logo, loaded from its website domain, on a light tile so dark logos stay visible.
 * Falls back to a letter mark when the logo can't be loaded.
 */
export function CompanyMonogram({ companyId, name, size = 'md' }: { companyId?: string; name: string; size?: 'md' | 'lg' }) {
  const domain = companyId ? companyDomains[companyId] : undefined
  const [attempt, setAttempt] = useState(0)
  const [best, setBest] = useState<{ src: string; width: number } | null>(null)
  const sources = domain ? logoSources(domain) : []
  const trying = sources[attempt]
  // Once every source has been tried, show the sharpest logo that loaded (or the letter mark).
  const src = trying ?? best?.src
  const tiny = !trying && (best?.width ?? 0) < minSharpWidth
  const box = size === 'lg' ? 'h-16 w-16 rounded-2xl' : 'h-11 w-11 rounded-xl'

  const next = (loaded?: { src: string; width: number }) => {
    if (loaded && (!best || loaded.width > best.width)) setBest(loaded)
    setAttempt((current) => current + 1)
  }

  if (src) {
    return (
      <span className={cn('grid shrink-0 place-items-center bg-pure p-1.5 ring-1 ring-slate-800', box)}>
        <img
          src={src}
          alt={`${name} logo`}
          loading="lazy"
          decoding="async"
          referrerPolicy="no-referrer"
          className={cn('object-contain', tiny ? 'h-1/2 w-1/2' : 'h-full w-full')}
          onLoad={(event) => {
            if (!trying) return
            const width = event.currentTarget.naturalWidth
            // Sharp enough: keep it. Otherwise remember it and try the next source.
            if (width >= minSharpWidth) {
              setBest({ src: trying, width })
              setAttempt(sources.length)
            } else {
              next({ src: trying, width })
            }
          }}
          onError={() => (trying ? next() : setBest(null))}
        />
      </span>
    )
  }

  const hash = [...name].reduce((total, char) => total + char.charCodeAt(0), 0)
  const letters = name
    .replace(/\(.*?\)/g, '')
    .replace(/[^a-z0-9\s]/gi, '')
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0])
    .join('')
    .toUpperCase()

  return (
    <span
      aria-hidden="true"
      className={cn('grid shrink-0 place-items-center font-semibold ring-1', box, size === 'lg' ? 'text-2xl' : 'text-base', palettes[hash % palettes.length])}
    >
      {letters}
    </span>
  )
}
