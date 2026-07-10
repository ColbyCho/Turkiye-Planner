export type Category = 'meal' | 'stay' | 'transport' | 'tour' | 'night' | 'misc'

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
