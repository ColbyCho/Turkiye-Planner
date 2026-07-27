import { createClient } from '@supabase/supabase-js'

// Anon key is a public, RLS-guarded key — safe to ship in a static bundle.
// Vercel env vars override the committed defaults if set.
const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://rhoupbaptxzambloocre.supabase.co'
const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJob3VwYmFwdHh6YW1ibG9vY3JlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODUwOTkzMjYsImV4cCI6MjEwMDY3NTMyNn0.GUcgMR8FjsCtOm1eKbFBjcu8VXqpeVLo6uaFEeW7nhg'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: { persistSession: false },
})

export interface Profile {
  id: string
  name: string
  avatar_url: string | null
}

export interface ReactionRow {
  id: string
  activity_id: string
  profile_id: string
  emoji: string
  created_at: string
}

export interface PollOption {
  id: string
  activity_id: string
  label: string
  created_by: string | null
  created_at: string
}

export interface PollVote {
  id: string
  option_id: string
  profile_id: string
  created_at: string
}

export const AVATARS_BUCKET = 'avatars'
