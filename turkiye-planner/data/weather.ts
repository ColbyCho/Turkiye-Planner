// ─────────────────────────────────────────────────────────────────────────────
// WHAT AUGUST IS LIKE — climate normals, not a forecast.
//
// The trip is far enough out that no forecast exists (and won't until about a
// week before), so these are long-run August averages. Swap them for a live
// forecast nearer the time if you like; the shape below is what the strip in
// the day header reads from.
// ─────────────────────────────────────────────────────────────────────────────

export interface CityClimate {
  /** Matched against a day's `city` string, case-insensitively. */
  match: string
  label: string
  highC: number
  lowC: number
  /** Sea temperature, where swimming is the point. */
  seaC?: number
  /** One-line texture: what the day actually feels like. */
  note: string
}

export const AUGUST_CLIMATE: CityClimate[] = [
  {
    match: 'bodrum',
    label: 'Bodrum',
    highC: 34,
    lowC: 25,
    seaC: 27,
    note: 'Blazing and dry — rain would be a genuine surprise. Shade at midday, swim at five.',
  },
  {
    match: 'istanbul',
    label: 'Istanbul',
    highC: 29,
    lowC: 22,
    seaC: 25,
    note: 'Hot and humid, cooler on the water. A rain day or two a month, so mostly sun.',
  },
  {
    match: 'boston',
    label: 'Boston',
    highC: 27,
    lowC: 18,
    note: 'Late-summer warm. Fine for a t-shirt to the airport.',
  },
]

export function cToF(c: number): number {
  return Math.round((c * 9) / 5 + 32)
}

/**
 * Climate for a day's city. Days written as 'Boston → Istanbul' get the
 * destination — that's where you'll actually be standing around.
 */
export function climateFor(city: string): CityClimate | null {
  const destination = city.split('→').pop()?.toLowerCase() ?? city.toLowerCase()
  return (
    AUGUST_CLIMATE.find((c) => destination.includes(c.match)) ??
    AUGUST_CLIMATE.find((c) => city.toLowerCase().includes(c.match)) ??
    null
  )
}
