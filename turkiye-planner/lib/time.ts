/** '09:30' -> 570. Hours may exceed 24 for past-midnight ends ('25:30' -> 1530). */
export function toMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(':').map(Number)
  return h * 60 + m
}

/** 570 -> '9:30 AM'. Values >= 1440 wrap into the next day ('1:30 AM'). */
export function formatMinutes(min: number): string {
  const h24 = Math.floor(min / 60) % 24
  const m = min % 60
  const ampm = h24 < 12 ? 'AM' : 'PM'
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12
  return m === 0 ? `${h12} ${ampm}` : `${h12}:${String(m).padStart(2, '0')} ${ampm}`
}

export function formatRange(start: string, end: string): string {
  return `${formatMinutes(toMinutes(start))} – ${formatMinutes(toMinutes(end))}`
}

export function formatDuration(start: string, end: string): string {
  const total = toMinutes(end) - toMinutes(start)
  const h = Math.floor(total / 60)
  const m = total % 60
  if (h === 0) return `${m} min`
  if (m === 0) return `${h} hr`
  return `${h} hr ${m} min`
}

/** Hour label for the left rail of the day grid. */
export function hourLabel(hour: number): string {
  if (hour === 0) return '12 AM'
  if (hour === 12) return '12 PM'
  return hour < 12 ? `${hour} AM` : `${hour - 12} PM`
}

/** '2026-08-21' -> 'Friday, August 21' (timezone-safe). */
export function formatDate(iso: string): string {
  const d = new Date(`${iso}T12:00:00Z`)
  return d.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  })
}

/** '2026-08-21' -> { weekday: 'FRI', day: 21 } for the date tabs. */
export function tabParts(iso: string): { weekday: string; day: number } {
  const d = new Date(`${iso}T12:00:00Z`)
  return {
    weekday: d
      .toLocaleDateString('en-US', { weekday: 'short', timeZone: 'UTC' })
      .toUpperCase(),
    day: d.getUTCDate(),
  }
}
