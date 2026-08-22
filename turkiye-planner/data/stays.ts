// ─────────────────────────────────────────────────────────────────────────────
// Where the crew sleeps — powers the "Taksi, lütfen" card. Hotel address
// verified against the hotel's site + TripAdvisor. Derin's house is a private
// home, so it stays a map pin only — no address in print.
// ─────────────────────────────────────────────────────────────────────────────

export interface Stay {
  id: string
  name: string
  /** Neighborhood / city — helps a driver place it instantly. */
  area: string
  /** Verified street address to show a driver. Omit if private/unknown. */
  address?: string
  phone?: string
  /** Best link to open in a maps app. */
  mapsUrl: string
  /** Aside shown under the card. */
  note?: string
  /** Nights covered, [from, to) — one stay can have several stints. */
  ranges: { from: string; to: string }[]
}

export const STAYS: Stay[] = [
  {
    id: 'orient-express',
    name: 'Orient Express & Spa by Orka Hotels',
    area: 'Sirkeci, Fatih — İstanbul',
    address: 'Hüdavendigar Cd. No. 24, 34120 Sirkeci/Fatih, İstanbul',
    phone: '+90 212 520 71 60',
    mapsUrl:
      'https://www.google.com/maps/search/?api=1&query=Orient%20Express%20%26%20Spa%20by%20Orka%20Hotels%2C%20H%C3%BCdavendigar%20Cd.%20No.%2024%2C%20Sirkeci%2C%20%C4%B0stanbul',
    ranges: [
      { from: '2026-08-22', to: '2026-08-25' },
      { from: '2026-08-30', to: '2026-08-31' },
    ],
  },
  {
    id: 'derin-house',
    name: 'Derin’s house',
    area: 'Bodrum',
    mapsUrl: 'https://maps.apple/p/aHh8XMifyYt9Q9',
    note: 'Private home — hand the driver the map pin, not an address.',
    ranges: [{ from: '2026-08-25', to: '2026-08-30' }],
  },
]

/** The stay whose nights include the given local date, if any. */
export function stayOn(dateISO: string): Stay | null {
  return (
    STAYS.find((s) => s.ranges.some((r) => dateISO >= r.from && dateISO < r.to)) ?? null
  )
}
