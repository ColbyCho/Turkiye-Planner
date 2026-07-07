export type Category = 'meal' | 'stay' | 'transport' | 'tour' | 'night' | 'misc'

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
}

export interface DayPlan {
  /** ISO date, e.g. '2026-08-21' */
  date: string
  /** Short editorial title for the day */
  title: string
  city: string
  activities: Activity[]
  funFact: string
}
