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

function logoUrl(domain: string) {
  return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=128`
}

/**
 * The company's own logo, loaded from its website domain, on a light tile so dark logos stay visible.
 * Falls back to a letter mark when the logo can't be loaded.
 */
export function CompanyMonogram({ companyId, name, size = 'md' }: { companyId?: string; name: string; size?: 'md' | 'lg' }) {
  const domain = companyId ? companyDomains[companyId] : undefined
  const [failed, setFailed] = useState(false)
  const box = size === 'lg' ? 'h-16 w-16 rounded-2xl' : 'h-11 w-11 rounded-xl'

  if (domain && !failed) {
    return (
      <span className={cn('grid shrink-0 place-items-center bg-white p-1.5 ring-1 ring-slate-700', box)}>
        <img
          src={logoUrl(domain)}
          alt={`${name} logo`}
          loading="lazy"
          decoding="async"
          referrerPolicy="no-referrer"
          className="h-full w-full object-contain"
          onError={() => setFailed(true)}
        />
      </span>
    )
  }

  const hash = [...name].reduce((total, char) => total + char.charCodeAt(0), 0)
  const letters = name
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
