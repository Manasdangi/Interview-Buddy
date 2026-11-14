import { cn } from '../../utils/cn'

const palettes = [
  'bg-indigo-500/20 text-indigo-200 ring-indigo-400/30',
  'bg-fuchsia-500/20 text-fuchsia-200 ring-fuchsia-400/30',
  'bg-cyan-500/20 text-cyan-200 ring-cyan-400/30',
  'bg-emerald-500/20 text-emerald-200 ring-emerald-400/30',
  'bg-amber-500/20 text-amber-200 ring-amber-400/30',
  'bg-rose-500/20 text-rose-200 ring-rose-400/30',
]

/** A neutral letter mark (no company logos) with a stable colour per name. */
export function CompanyMonogram({ name, size = 'md' }: { name: string; size?: 'md' | 'lg' }) {
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
      className={cn(
        'grid shrink-0 place-items-center rounded-2xl font-semibold ring-1',
        size === 'lg' ? 'h-16 w-16 text-2xl' : 'h-11 w-11 text-base',
        palettes[hash % palettes.length],
      )}
    >
      {letters}
    </span>
  )
}
