import { useSyncExternalStore } from 'react'

export type Theme = 'light' | 'dark'

/** Keep in sync with the inline script in index.html that applies the theme before first paint. */
export const themeStorageKey = 'interview-buddy:theme'

const listeners = new Set<() => void>()

function readTheme(): Theme {
  return typeof document !== 'undefined' && document.documentElement.classList.contains('dark') ? 'dark' : 'light'
}

export function setTheme(theme: Theme) {
  const root = document.documentElement
  root.classList.toggle('dark', theme === 'dark')
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'dark' ? '#020617' : '#f4f6fb')
  try {
    window.localStorage.setItem(themeStorageKey, theme)
  } catch {
    // Storage can be unavailable (private mode); the theme still applies for this visit.
  }
  listeners.forEach((listener) => listener())
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

/** Light is the default; the choice is remembered per browser. */
export function useTheme() {
  const theme = useSyncExternalStore(subscribe, readTheme, () => 'light' as Theme)
  return { theme, setTheme, toggleTheme: () => setTheme(theme === 'dark' ? 'light' : 'dark') }
}
