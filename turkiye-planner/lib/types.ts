export type Category =
  | 'meal'
  | 'stay'
  | 'transport'
  | 'tour'
  | 'night'
  | 'adventure'
  | 'misc'

export interface ActivityImage {
  /** Path under /public, e.g. '/postcards/hagia-sophia.jpg' */
  src: string
  alt: string
  /** Short name for the photo-credit line. */
  creditName?: string
  /** Source page with author + license details (e.g. Wikimedia Commons file page). */
  creditUrl?: string
}

export interface Activity {
  id: string
  title: string
  category: Category
  /** 24h 'HH:MM', e.g. '09:30' */
  start: string
  /**
   * 24h 'HH:MM'. May exceed 24:00 for activities that spill past midnight —
   * e.g. '26:00' means 2:00 AM the next day. The grid clamps the visual block
   * at midnight; calendar exports keep the true end time.
   */
  end: string
  location?: string
  /** Link to tickets, reservation, booking confirmation, etc. */
  url?: string
  notes?: string
  participants: string[]
  /** Square photo shown at the top of the activity modal. */
  image?: ActivityImage
  /**
   * Emoji for the modal's tile when there's no photo.
   * Falls back to the category icon.
   */
  emoji?: string
}

/**
 * The human side of a crew member. Names live in `CREW` (data/itinerary.ts);
 * everything here is optional flavor — the profile card hides what's missing.
 */
export interface CrewProfile {
  /** Square photo under /public/crew, e.g. '/crew/matt.jpg'. */
  photo?: string
  /** Passport-style "occupation" — the joke title. */
  title?: string
  homeCity?: string
  /** ISO date they join the trip, if not day one. */
  joins?: string
  /** ISO date they head home, if not the last day. */
  leaves?: string
  knownFor?: string
  /** Allergies / vegetarian / "will not eat fish" — the useful kind. */
  dietary?: string
  funFact?: string
  /** Handwritten line under the polaroid. */
  quote?: string
}

export interface DayPlan {
  /** ISO date, e.g. '2026-08-21' */
  date: string
  /** Short editorial title for the day */
  title: string
  city: string
  activities: Activity[]
  funFact: string
  /**
   * UTC offset (hours) that this day's times are written in. Defaults to 3
   * (Türkiye). The Boston departure day uses -4 (EDT) so calendar exports
   * land at the right real-world moment.
   */
  utcOffsetHours?: number
  /** IANA timezone for calendar display. Defaults to 'Europe/Istanbul'. */
  timeZone?: string
}
