const baseURL = import.meta.env.VITE_API_BASE_URL || '/api'
const visitorKey = 'ib-visitor-id'
const countedKey = 'ib-visit-counted'

export type SiteStats = { views: number; visitors: number }

function getVisitorId() {
  try {
    let id = window.localStorage.getItem(visitorKey)
    if (!id) {
      id = crypto.randomUUID()
      window.localStorage.setItem(visitorKey, id)
    }
    return id
  } catch {
    return crypto.randomUUID()
  }
}

function alreadyCounted() {
  try {
    if (window.sessionStorage.getItem(countedKey)) return true
    window.sessionStorage.setItem(countedKey, '1')
  } catch {
    /* storage blocked: count this load */
  }
  return false
}

async function parse(response: Response) {
  if (!response.ok) throw new Error('stats unavailable')
  return (await response.json()) as SiteStats
}

/** Counts this visit once per browser tab session, then returns the totals. */
export async function loadSiteStats(): Promise<SiteStats> {
  if (alreadyCounted()) return parse(await fetch(`${baseURL}/stats`))
  return parse(
    await fetch(`${baseURL}/stats`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ visitorId: getVisitorId() }),
    }),
  )
}
