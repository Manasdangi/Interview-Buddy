/** Formats an ISO timestamp as local time ("11:00 PM"), adding the date when it isn't today. */
export function formatMessageTime(value: string, now = new Date()) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value

  const time = date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
  if (date.toDateString() === now.toDateString()) return time

  return `${date.toLocaleDateString([], { month: 'short', day: 'numeric' })}, ${time}`
}
