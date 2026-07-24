import type { Activity, DayPlan } from './types'

/** Google Maps caps a directions link at nine intermediate stops. */
const MAX_WAYPOINTS = 9

/**
 * The city to disambiguate a location with — but only on days spent in one
 * place. On a travel day ('Boston → Istanbul') there is no single answer, and
 * guessing turns "Boston Logan" into "Boston Logan, Istanbul".
 */
function cityHint(day: DayPlan): string | null {
  return day.city.includes('→') ? null : day.city.trim()
}

/** Adds the city unless the day is ambiguous or the location already says it. */
function qualify(location: string, city: string | null): string {
  if (!city || location.toLowerCase().includes(city.toLowerCase())) return location
  return `${location}, ${city}`
}

/** Route legs ('BOS → IST') are two places, so they aren't a map pin. */
function isPlace(location: string | undefined): location is string {
  return Boolean(location && !location.includes('→'))
}

export function mapSearchUrl(query: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`
}

export function activityMapUrl(activity: Activity, day: DayPlan): string | null {
  if (!isPlace(activity.location)) return null
  return mapSearchUrl(qualify(activity.location, cityHint(day)))
}

/**
 * One link that plots the day's stops in order. Returns null for days with
 * nothing placeable (travel days where every activity is a flight number).
 */
export function dayRouteUrl(day: DayPlan): string | null {
  const city = cityHint(day)
  const stops = day.activities
    // Hotels aren't stops and flights aren't walkable.
    .filter((a) => a.category !== 'stay' && a.category !== 'transport')
    .filter((a) => isPlace(a.location))
    .map((a) => qualify(a.location as string, city))
    .filter((stop, i, all) => stop !== all[i - 1])

  if (stops.length === 0) return null
  if (stops.length === 1) return mapSearchUrl(stops[0])

  const origin = stops[0]
  const destination = stops[stops.length - 1]
  const middle = stops.slice(1, -1).slice(0, MAX_WAYPOINTS)
  const params = new URLSearchParams({
    api: '1',
    origin,
    destination,
    travelmode: 'walking',
  })
  if (middle.length) params.set('waypoints', middle.join('|'))
  return `https://www.google.com/maps/dir/?${params.toString()}`
}
