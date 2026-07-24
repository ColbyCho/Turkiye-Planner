// Row shapes shared by both backends. Column names are snake_case because they
// are literally the Postgres columns (see supabase/schema.sql) — PostgREST
// returns them verbatim and the local fallback mirrors them exactly, so code
// that reads a row can't tell which backend it came from.

/** Self-edited profile fields. Overlays the static defaults in data/crew.ts. */
export interface ProfileRow {
  name: string
  photo_url?: string | null
  title?: string | null
  home_city?: string | null
  known_for?: string | null
  dietary?: string | null
  fun_fact?: string | null
  quote?: string | null
  room?: string | null
  seat_out?: string | null
  seat_home?: string | null
  /** Answers to FUN_QUESTIONS, keyed by question id. */
  fun?: Record<string, string> | null
  updated_at?: string
}

/** One person's verdict on one activity. -1 skip · 0 neutral · 1 in. */
export interface VoteRow {
  activity_id: string
  voter: string
  value: number
  updated_at?: string
}

export interface ReactionRow {
  activity_id: string
  author: string
  emoji: string
  created_at?: string
}

export interface CommentRow {
  id: string
  activity_id: string
  author: string
  body: string
  created_at: string
}

/** A suggested activity, before it graduates into data/itinerary.ts. */
export interface ProposalRow {
  id: string
  author: string
  title: string
  day_date: string
  start?: string | null
  end?: string | null
  category?: string | null
  notes?: string | null
  url?: string | null
  created_at: string
}

export interface PollOption {
  id: string
  label: string
}

export interface PollRow {
  id: string
  author: string
  day_date: string
  question: string
  options: PollOption[]
  created_at: string
}

export interface PollVoteRow {
  poll_id: string
  voter: string
  option_id: string
  updated_at?: string
}

export interface PhotoRow {
  id: string
  author: string
  day_date: string
  /** Public URL (Supabase Storage) or a data URL in local mode. */
  url: string
  caption?: string | null
  created_at: string
}

export interface TableMap {
  profiles: ProfileRow
  votes: VoteRow
  reactions: ReactionRow
  comments: CommentRow
  proposals: ProposalRow
  polls: PollRow
  poll_votes: PollVoteRow
  photos: PhotoRow
}

export type TableName = keyof TableMap

/** Primary key columns per table — used to upsert and to delete a single row. */
export const PRIMARY_KEYS: { [K in TableName]: (keyof TableMap[K] & string)[] } = {
  profiles: ['name'],
  votes: ['activity_id', 'voter'],
  reactions: ['activity_id', 'author', 'emoji'],
  comments: ['id'],
  proposals: ['id'],
  polls: ['id'],
  poll_votes: ['poll_id', 'voter'],
  photos: ['id'],
}
