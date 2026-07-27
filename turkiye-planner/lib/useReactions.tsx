'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { supabase, type ReactionRow } from './supabase'

/** One emoji's aggregated reaction on an activity. */
export interface EmojiAgg {
  emoji: string
  /** distinct profile ids who reacted with this emoji */
  profileIds: string[]
  count: number
  /** earliest reaction time, for left-to-right ordering */
  firstAt: number
}

interface ReactionsContextValue {
  ready: boolean
  getFor: (activityId: string) => EmojiAgg[]
  hasMine: (activityId: string, emoji: string, meId: string | null) => boolean
  toggle: (activityId: string, emoji: string, meId: string) => Promise<void>
}

const ReactionsContext = createContext<ReactionsContextValue | null>(null)

function tempId(): string {
  try {
    return `temp-${crypto.randomUUID()}`
  } catch {
    return `temp-${Math.random().toString(36).slice(2)}`
  }
}

export function ReactionsProvider({ children }: { children: ReactNode }) {
  const [rows, setRows] = useState<ReactionRow[]>([])
  const [ready, setReady] = useState(false)

  useEffect(() => {
    let alive = true
    supabase
      .from('reactions')
      .select('*')
      .then(({ data }) => {
        if (!alive) return
        if (data) setRows(data as ReactionRow[])
        setReady(true)
      })

    // Live updates for the whole group.
    const channel = supabase
      .channel('reactions-realtime')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'reactions' },
        (payload) => {
          const r = payload.new as ReactionRow
          setRows((prev) => (prev.some((x) => x.id === r.id) ? prev : [...prev, r]))
        }
      )
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'reactions' },
        (payload) => {
          const oldId = (payload.old as { id?: string }).id
          if (oldId) setRows((prev) => prev.filter((x) => x.id !== oldId))
        }
      )
      .subscribe()

    return () => {
      alive = false
      supabase.removeChannel(channel)
    }
  }, [])

  // activity_id -> emoji -> { distinct profiles, earliest time }
  const byActivity = useMemo(() => {
    const m = new Map<string, Map<string, { profiles: Set<string>; firstAt: number }>>()
    for (const r of rows) {
      let am = m.get(r.activity_id)
      if (!am) {
        am = new Map()
        m.set(r.activity_id, am)
      }
      let em = am.get(r.emoji)
      if (!em) {
        em = { profiles: new Set(), firstAt: Infinity }
        am.set(r.emoji, em)
      }
      em.profiles.add(r.profile_id)
      const t = Date.parse(r.created_at) || 0
      if (t < em.firstAt) em.firstAt = t
    }
    return m
  }, [rows])

  const getFor = useCallback(
    (activityId: string): EmojiAgg[] => {
      const am = byActivity.get(activityId)
      if (!am) return []
      return Array.from(am.entries())
        .map(([emoji, v]) => ({
          emoji,
          profileIds: Array.from(v.profiles),
          count: v.profiles.size,
          firstAt: v.firstAt,
        }))
        .sort((a, b) => a.firstAt - b.firstAt)
    },
    [byActivity]
  )

  const hasMine = useCallback(
    (activityId: string, emoji: string, meId: string | null) => {
      if (!meId) return false
      return !!byActivity.get(activityId)?.get(emoji)?.profiles.has(meId)
    },
    [byActivity]
  )

  const toggle = useCallback(
    async (activityId: string, emoji: string, meId: string) => {
      const mine = !!byActivity.get(activityId)?.get(emoji)?.profiles.has(meId)
      if (mine) {
        setRows((prev) =>
          prev.filter(
            (r) => !(r.activity_id === activityId && r.profile_id === meId && r.emoji === emoji)
          )
        )
        await supabase
          .from('reactions')
          .delete()
          .match({ activity_id: activityId, profile_id: meId, emoji })
      } else {
        const temp: ReactionRow = {
          id: tempId(),
          activity_id: activityId,
          profile_id: meId,
          emoji,
          created_at: new Date().toISOString(),
        }
        setRows((prev) => [...prev, temp])
        const { data, error } = await supabase
          .from('reactions')
          .insert({ activity_id: activityId, profile_id: meId, emoji })
          .select()
          .single()
        if (!error && data) {
          setRows((prev) => prev.map((r) => (r.id === temp.id ? (data as ReactionRow) : r)))
        } else if (error) {
          // unique-violation means it already exists elsewhere; just drop the temp
          setRows((prev) => prev.filter((r) => r.id !== temp.id))
        }
      }
    },
    [byActivity]
  )

  const value = useMemo<ReactionsContextValue>(
    () => ({ ready, getFor, hasMine, toggle }),
    [ready, getFor, hasMine, toggle]
  )

  return <ReactionsContext.Provider value={value}>{children}</ReactionsContext.Provider>
}

export function useReactions(): ReactionsContextValue {
  const ctx = useContext(ReactionsContext)
  if (!ctx) throw new Error('useReactions must be used within ReactionsProvider')
  return ctx
}

/**
 * The leading emoji of a string, or null if it starts with ordinary text.
 * Keeps a full emoji cluster together (ZWJ sequences, variation selectors,
 * skin-tone modifiers, and 2-part flags).
 */
export function firstEmoji(input: string): string | null {
  const s = input.trim()
  if (!s) return null
  const chars = Array.from(s)
  const firstCp = chars[0].codePointAt(0) ?? 0
  // Anything in Basic Latin / Latin-1 is ordinary text a user typed by mistake.
  if (firstCp <= 0x00ff) return null

  let cluster = chars[0]
  for (let i = 1; i < chars.length; i++) {
    const cp = chars[i].codePointAt(0) ?? 0
    const prevCp = chars[i - 1].codePointAt(0) ?? 0
    const joins =
      cp === 0x200d || // zero-width joiner
      cp === 0xfe0f || // variation selector-16
      (cp >= 0x1f3fb && cp <= 0x1f3ff) || // skin-tone modifiers
      (cp >= 0x1f1e6 && cp <= 0x1f1ff) // regional indicators (flags)
    if (joins || prevCp === 0x200d) cluster += chars[i]
    else break
  }
  return cluster
}
