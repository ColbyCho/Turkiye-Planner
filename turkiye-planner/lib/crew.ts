import { CREW, ITINERARY } from '@/data/itinerary'
import { CREW_PROFILES } from '@/data/crew'
import type { Activity, Category, CrewProfile, DayPlan } from './types'
import { toMinutes } from './time'

/** One of the nine names in the CREW array. */
export type CrewName = (typeof CREW)[number]

// One fixed color per crew member so avatars stay consistent across the trip
const AVATAR_COLORS = [
  '#1E4B8E', // cobalt
  '#C1440E', // spice
  '#178A99', // turquoise
  '#A66E15', // saffron dark
  '#2C2A4A', // night
  '#8F7C5F', // kraft dark
  '#96340B', // spice dark
  '#0F6773', // turquoise dark
  '#565285', // night light
]

export function avatarColor(name: string): string {
  const i = (CREW as readonly string[]).indexOf(name)
  if (i >= 0) return AVATAR_COLORS[i % AVATAR_COLORS.length]
  // Fallback for guest names added later
  const hash = name.split('').reduce((h, ch) => h + ch.charCodeAt(0), 0)
  return AVATAR_COLORS[hash % AVATAR_COLORS.length]
}

export function isCrewName(value: unknown): value is CrewName {
  return typeof value === 'string' && (CREW as readonly string[]).includes(value)
}

export function profileFor(name: CrewName): CrewProfile {
  return CREW_PROFILES[name] ?? {}
}

export function isOn(activity: Activity, name: string | null): boolean {
  return name !== null && activity.participants.includes(name)
}

export interface CrewEvent {
  /** Index into ITINERARY — what the planner needs to jump there. */
  dayIndex: number
  day: DayPlan
  activity: Activity
}

/** Every activity this person is on, in trip order. */
export function eventsFor(name: string, days: DayPlan[] = ITINERARY): CrewEvent[] {
  return days.flatMap((day, dayIndex) =>
    day.activities
      .filter((activity) => isOn(activity, name))
      .sort((a, b) => toMinutes(a.start) - toMinutes(b.start))
      .map((activity) => ({ dayIndex, day, activity }))
  )
}

export interface CrewStats {
  activityCount: number
  /** Days they appear on at all — Hannah's is shorter than the trip. */
  dayCount: number
  firstDate: string | null
  lastDate: string | null
  /** The category they're booked into most, for the "known for" line. */
  topCategory: Category | null
  /** Scheduled hours, rounded. Excludes 'stay' — a hotel block isn't a plan. */
  hours: number
}

export function statsFor(name: string, days: DayPlan[] = ITINERARY): CrewStats {
  const events = eventsFor(name, days)
  const dates = events
    .map((e) => e.day.date)
    .filter((date, i, all) => all.indexOf(date) === i)
    .sort()

  const byCategory: Partial<Record<Category, number>> = {}
  let minutes = 0
  for (const { activity } of events) {
    byCategory[activity.category] = (byCategory[activity.category] ?? 0) + 1
    if (activity.category !== 'stay') {
      minutes += Math.max(0, toMinutes(activity.end) - toMinutes(activity.start))
    }
  }
  const topCategory =
    (Object.keys(byCategory) as Category[]).sort(
      (a, b) => (byCategory[b] ?? 0) - (byCategory[a] ?? 0)
    )[0] ?? null

  return {
    activityCount: events.length,
    dayCount: dates.length,
    firstDate: dates[0] ?? null,
    lastDate: dates[dates.length - 1] ?? null,
    topCategory,
    hours: Math.round(minutes / 60),
  }
}
