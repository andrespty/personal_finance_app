/** Today's date in the person's own time zone, as YYYY-MM-DD. */
export function todayISO(now: Date = new Date()): string {
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, '0')
  const d = String(now.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

const sameYear = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' })
const otherYear = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
})

/** Formats a YYYY-MM-DD date as "Today", "Yesterday", "Oct 12" or "Oct 12, 2025". */
export function formatDay(iso: string, now: Date = new Date()): string {
  const today = todayISO(now)
  if (iso === today) return 'Today'
  const yesterday = new Date(now)
  yesterday.setDate(now.getDate() - 1)
  if (iso === todayISO(yesterday)) return 'Yesterday'

  const [y, m, d] = iso.split('-').map(Number)
  const date = new Date(y, m - 1, d)
  return (y === now.getFullYear() ? sameYear : otherYear).format(date)
}
