import type { CrewProfile } from '@/lib/types'
import type { CrewName } from '@/lib/crew'

// ─────────────────────────────────────────────────────────────────────────────
// CREW PROFILES — the passport page behind each name.
//
// Names themselves live in the CREW array in ./itinerary.ts. Everything here is
// optional: leave a field out and the profile card simply doesn't show that row.
//
// PHOTOS: drop a square-ish image in /public/crew (e.g. /public/crew/matt.jpg)
// and set `photo: '/crew/matt.jpg'`. Without one, the card falls back to the
// person's initial on their avatar color. Photos are committed to the repo and
// shipped to a public host — only use ones everyone's happy to have public.
//
// Anything marked “Placeholder” is a stand-in — rewrite freely.
// ─────────────────────────────────────────────────────────────────────────────
export const CREW_PROFILES: Record<CrewName, CrewProfile> = {
  Colby: {
    title: 'Placeholder — Trip Commissioner',
    quote: 'Placeholder: a line in their own words.',
  },
  Olivia: {
    title: 'Placeholder — Minister of Itineraries',
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
    // Hannah meets the group on the 25th for the flight to Bodrum.
    joins: '2026-08-25',
  },
  Bob: {
    title: 'Placeholder — Chief Vibes Officer',
  },
  Reese: {
    title: 'Placeholder — Photographer at Large',
  },
}
