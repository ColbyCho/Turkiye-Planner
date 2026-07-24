import type { Activity, DayPlan } from './types'
import { toMinutes } from './time'
import { CATEGORIES } from './categories'

// Türkiye is UTC+3 year-round (no DST since 2016), so a fixed offset is safe.
// Days can override this (e.g. the Boston departure day is written in EDT).
const DEFAULT_OFFSET_HOURS = 3

/** UTC timestamp ('20260821T163000Z') for a local date + minutes-from-midnight. */
function utcStamp(isoDate: string, minutes: number, offsetHours = DEFAULT_OFFSET_HOURS): string {
  const [y, m, d] = isoDate.split('-').map(Number)
  const utc = new Date(Date.UTC(y, m - 1, d) + minutes * 60_000 - offsetHours * 3_600_000)
  const pad = (n: number) => String(n).padStart(2, '0')
  return (
    `${utc.getUTCFullYear()}${pad(utc.getUTCMonth() + 1)}${pad(utc.getUTCDate())}` +
    `T${pad(utc.getUTCHours())}${pad(utc.getUTCMinutes())}00Z`
  )
}

function describe(activity: Activity): string {
  const parts: string[] = []
  if (activity.notes) parts.push(activity.notes)
  parts.push(`Who: ${activity.participants.join(', ')}`)
  if (activity.url) parts.push(activity.url)
  return parts.join('\n\n')
}

function escapeICS(text: string): string {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\r?\n/g, '\\n')
}

const CALENDAR_HEADER = [
  'BEGIN:VCALENDAR',
  'VERSION:2.0',
  'PRODID:-//Turkiye Planner//EN',
  'CALSCALE:GREGORIAN',
  'METHOD:PUBLISH',
]

function vevent(day: DayPlan, activity: Activity): string[] {
  const category = CATEGORIES[activity.category].label
  return [
    'BEGIN:VEVENT',
    `UID:${activity.id}-${day.date}@turkiye-planner`,
    `DTSTAMP:${utcStamp(day.date, 0)}`,
    `DTSTART:${utcStamp(day.date, toMinutes(activity.start), day.utcOffsetHours)}`,
    `DTEND:${utcStamp(day.date, toMinutes(activity.end), day.utcOffsetHours)}`,
    `SUMMARY:${escapeICS(activity.title)}`,
    `DESCRIPTION:${escapeICS(`[${category}] ` + describe(activity))}`,
    ...(activity.location ? [`LOCATION:${escapeICS(activity.location)}`] : []),
    ...(activity.url ? [`URL:${activity.url}`] : []),
    'END:VEVENT',
  ]
}

export function buildICS(day: DayPlan, activity: Activity): string {
  return [...CALENDAR_HEADER, ...vevent(day, activity), 'END:VCALENDAR'].join('\r\n')
}

/**
 * One calendar file for the whole trip. With `who`, only the activities that
 * person is on — the payoff for telling the planner which one you are.
 */
export function buildTripICS(days: DayPlan[], who?: string): string {
  const events = days.flatMap((day) =>
    day.activities
      .filter((a) => !who || a.participants.includes(who))
      .flatMap((a) => vevent(day, a))
  )
  return [...CALENDAR_HEADER, ...events, 'END:VCALENDAR'].join('\r\n')
}

function download(filename: string, ics: string): void {
  const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

export function downloadICS(day: DayPlan, activity: Activity): void {
  download(
    `${activity.title.replace(/[^\w]+/g, '-').toLowerCase()}.ics`,
    buildICS(day, activity)
  )
}

export function downloadTripICS(days: DayPlan[], who?: string): void {
  const slug = who ? `-${who.toLowerCase()}` : ''
  download(`turkiye-2026${slug}.ics`, buildTripICS(days, who))
}

export function googleCalendarUrl(day: DayPlan, activity: Activity): string {
  const start = utcStamp(day.date, toMinutes(activity.start), day.utcOffsetHours)
  const end = utcStamp(day.date, toMinutes(activity.end), day.utcOffsetHours)
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: activity.title,
    dates: `${start}/${end}`,
    details: describe(activity),
    ctz: day.timeZone ?? 'Europe/Istanbul',
  })
  if (activity.location) params.set('location', activity.location)
  return `https://calendar.google.com/calendar/render?${params.toString()}`
}
