import type { CrewProfile, FunQuestion } from '@/lib/types'

// ─────────────────────────────────────────────────────────────────────────────
// THE CREW — the single source of truth for who's on this trip.
// Edit these names and they update everywhere: the itinerary's participant
// lists, the name picker, the profile cards, the masthead count.
// ─────────────────────────────────────────────────────────────────────────────
export const CREW = [
  'Colby',
  'Maddie',
  'Andrew',
  'Derin',
  'Matt',
  'Hannah',
  'Bob',
] as const

export type CrewName = (typeof CREW)[number]

// ─────────────────────────────────────────────────────────────────────────────
// PROFILES — the passport page behind each name.
//
// Every field is optional; the card hides whatever's missing. Anything marked
// “Placeholder” is a stand-in — rewrite freely.
//
// PHOTOS: drop a square image in /public/crew (e.g. /public/crew/matt.jpg) and
// set `photo: '/crew/matt.jpg'`. Without one, the card falls back to the
// person's initial on their avatar color. See public/crew/README.md.
//
// `joins` / `leaves` drive who's on the trip on a given day — the itinerary's
// participant lists are built from them, so a changed flight only needs editing
// here.
//
// The `fun` answers are what everyone fills in themselves from the profile
// card's edit form; anything set here is just a starting value.
// ─────────────────────────────────────────────────────────────────────────────
export const CREW_PROFILES: Record<CrewName, CrewProfile> = {
  Colby: {
    title: 'Placeholder — Trip Commissioner',
  },
  Maddie: {
    title: 'Placeholder — Head of Snacks',
  },
  Andrew: {
    title: 'Placeholder — Navigator',
  },
  Derin: {
    title: 'Placeholder — Resident Türkçe Desk',
  },
  Matt: {
    title: 'Placeholder — Keeper of the Planner',
  },
  Hannah: {
    title: 'Placeholder — Late Arrival, Big Entrance',
    // Meets the group on the 25th for the flight to Bodrum.
    joins: '2026-08-25',
  },
  Bob: {
    title: 'Placeholder — Chief Vibes Officer',
  },
}

// ─────────────────────────────────────────────────────────────────────────────
// THE QUESTIONNAIRE — what everyone fills in on their own profile.
// Add a question here and it shows up in the edit form and on every card;
// answers are stored by `id`, so reordering or relabeling is safe.
// ─────────────────────────────────────────────────────────────────────────────
export const FUN_QUESTIONS: FunQuestion[] = [
  {
    id: 'excited',
    emoji: '✨',
    label: 'Most excited for',
    placeholder: 'the one thing you’d be sad to miss',
  },
  {
    id: 'hype',
    emoji: '🎧',
    label: 'Hype song',
    placeholder: 'what goes on when the van doors close',
  },
  {
    id: 'coffee',
    emoji: '☕',
    label: 'Coffee order',
    placeholder: 'so someone else can grab it',
  },
  {
    id: 'talent',
    emoji: '🎪',
    label: 'Hidden talent',
    placeholder: 'the party trick',
  },
  {
    id: 'packing',
    emoji: '🧳',
    label: 'Always overpacks',
    placeholder: 'the thing you bring six of',
  },
  {
    id: 'hottake',
    emoji: '🌶️',
    label: 'Hot take',
    placeholder: 'defend it at dinner',
  },
  {
    id: 'turkish',
    emoji: '🇹🇷',
    label: 'Turkish word to learn',
    placeholder: 'the one you’re determined to use',
  },
  {
    id: 'mood',
    emoji: '🔮',
    label: 'Vacation personality',
    placeholder: 'up at 6 for the sunrise, or up at 6 still out?',
  },
]

/** Everyone on the trip on a given ISO date, per their joins/leaves dates. */
export function crewOn(date: string): CrewName[] {
  return CREW.filter((name) => {
    const { joins, leaves } = CREW_PROFILES[name] ?? {}
    if (joins && date < joins) return false
    if (leaves && date > leaves) return false
    return true
  })
}
