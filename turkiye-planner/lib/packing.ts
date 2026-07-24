'use client'

// ─────────────────────────────────────────────────────────────────────────────
// The packing list is deliberately NOT in the database: it's nobody else's
// business whether you've packed socks. It lives in this browser, per person.
// ─────────────────────────────────────────────────────────────────────────────

export interface PackingGroup {
  title: string
  emoji: string
  items: string[]
}

export const DEFAULT_PACKING: PackingGroup[] = [
  {
    title: 'Documents & money',
    emoji: '🛂',
    items: [
      'Passport (6+ months validity)',
      'e-Visa saved offline',
      'Card with no foreign transaction fee',
      'Some lira for taxis & markets',
      'Travel insurance details',
      'Photo of passport in your notes app',
    ],
  },
  {
    title: 'Istanbul days',
    emoji: '🕌',
    items: [
      'Shoulders-and-knees layer for mosques',
      'Scarf (required for women in mosques)',
      'Shoes you can slip off easily',
      'Actually comfortable walking shoes',
      'Day bag that zips',
    ],
  },
  {
    title: 'Bodrum days',
    emoji: '🏖️',
    items: [
      'Swimsuit ×2',
      'Reef-safe sunscreen',
      'Sunglasses + hat',
      'Quick-dry towel',
      'Something for a nice dinner',
    ],
  },
  {
    title: 'Tech',
    emoji: '🔌',
    items: [
      'Type-C/F adapter (Türkiye plugs)',
      'Battery pack',
      'Charging cables ×2',
      'Headphones',
      'Offline maps downloaded',
    ],
  },
  {
    title: 'Body',
    emoji: '🧴',
    items: [
      'Meds in original packaging',
      'Motion sickness tablets (boat days)',
      'Electrolytes',
      'Blister plasters',
      'Bug spray',
    ],
  },
]

const KEY_PREFIX = 'turkiye-planner.packing.'

export interface PackingState {
  checked: string[]
  custom: string[]
}

const EMPTY: PackingState = { checked: [], custom: [] }

export function readPacking(name: string): PackingState {
  if (typeof window === 'undefined') return EMPTY
  try {
    const raw = window.localStorage.getItem(KEY_PREFIX + name)
    if (!raw) return EMPTY
    const parsed = JSON.parse(raw) as Partial<PackingState>
    return { checked: parsed.checked ?? [], custom: parsed.custom ?? [] }
  } catch {
    return EMPTY
  }
}

export function writePacking(name: string, state: PackingState): void {
  try {
    window.localStorage.setItem(KEY_PREFIX + name, JSON.stringify(state))
  } catch {
    // Out of storage — the list still works for this session.
  }
}

export function totalItems(custom: string[]): number {
  return DEFAULT_PACKING.reduce((n, g) => n + g.items.length, 0) + custom.length
}
