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
import { supabase, type PollOption, type PollVote } from './supabase'

export interface PollOptionAgg {
  id: string
  label: string
  createdBy: string | null
  voterIds: string[]
  createdAt: number
}

interface PollsContextValue {
  ready: boolean
  getFor: (activityId: string) => PollOptionAgg[]
  hasVote: (optionId: string, meId: string | null) => boolean
  addOption: (activityId: string, label: string, meId: string) => Promise<void>
  toggleVote: (optionId: string, meId: string) => Promise<void>
  removeOption: (optionId: string) => Promise<void>
}

const PollsContext = createContext<PollsContextValue | null>(null)

function tempId(): string {
  try {
    return `temp-${crypto.randomUUID()}`
  } catch {
    return `temp-${Math.random().toString(36).slice(2)}`
  }
}

export function PollsProvider({ children }: { children: ReactNode }) {
  const [options, setOptions] = useState<PollOption[]>([])
  const [votes, setVotes] = useState<PollVote[]>([])
  const [ready, setReady] = useState(false)

  useEffect(() => {
    let alive = true
    Promise.all([
      supabase.from('poll_options').select('*'),
      supabase.from('poll_votes').select('*'),
    ]).then(([o, v]) => {
      if (!alive) return
      if (o.data) setOptions(o.data as PollOption[])
      if (v.data) setVotes(v.data as PollVote[])
      setReady(true)
    })

    const channel = supabase
      .channel('polls-realtime')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'poll_options' },
        (p) => {
          const r = p.new as PollOption
          setOptions((prev) => (prev.some((x) => x.id === r.id) ? prev : [...prev, r]))
        }
      )
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'poll_options' },
        (p) => {
          const id = (p.old as { id?: string }).id
          if (!id) return
          setOptions((prev) => prev.filter((x) => x.id !== id))
          setVotes((prev) => prev.filter((v) => v.option_id !== id))
        }
      )
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'poll_votes' }, (p) => {
        const r = p.new as PollVote
        setVotes((prev) => (prev.some((x) => x.id === r.id) ? prev : [...prev, r]))
      })
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'poll_votes' }, (p) => {
        const id = (p.old as { id?: string }).id
        if (id) setVotes((prev) => prev.filter((x) => x.id !== id))
      })
      .subscribe()

    return () => {
      alive = false
      supabase.removeChannel(channel)
    }
  }, [])

  const votesByOption = useMemo(() => {
    const m = new Map<string, Set<string>>()
    for (const v of votes) {
      let s = m.get(v.option_id)
      if (!s) {
        s = new Set()
        m.set(v.option_id, s)
      }
      s.add(v.profile_id)
    }
    return m
  }, [votes])

  const byActivity = useMemo(() => {
    const m = new Map<string, PollOptionAgg[]>()
    const sorted = [...options].sort(
      (a, b) => (Date.parse(a.created_at) || 0) - (Date.parse(b.created_at) || 0)
    )
    for (const o of sorted) {
      const arr = m.get(o.activity_id) ?? []
      arr.push({
        id: o.id,
        label: o.label,
        createdBy: o.created_by,
        voterIds: Array.from(votesByOption.get(o.id) ?? []),
        createdAt: Date.parse(o.created_at) || 0,
      })
      m.set(o.activity_id, arr)
    }
    return m
  }, [options, votesByOption])

  const getFor = useCallback(
    (activityId: string) => byActivity.get(activityId) ?? [],
    [byActivity]
  )

  const hasVote = useCallback(
    (optionId: string, meId: string | null) => !!meId && !!votesByOption.get(optionId)?.has(meId),
    [votesByOption]
  )

  const addOption = useCallback(async (activityId: string, label: string, meId: string) => {
    const clean = label.trim()
    if (!clean) return
    const temp: PollOption = {
      id: tempId(),
      activity_id: activityId,
      label: clean,
      created_by: meId,
      created_at: new Date().toISOString(),
    }
    setOptions((prev) => [...prev, temp])
    const { data, error } = await supabase
      .from('poll_options')
      .insert({ activity_id: activityId, label: clean, created_by: meId })
      .select()
      .single()
    if (!error && data) {
      setOptions((prev) => prev.map((o) => (o.id === temp.id ? (data as PollOption) : o)))
    } else if (error) {
      setOptions((prev) => prev.filter((o) => o.id !== temp.id))
    }
  }, [])

  const toggleVote = useCallback(
    async (optionId: string, meId: string) => {
      const voted = !!votesByOption.get(optionId)?.has(meId)
      if (voted) {
        setVotes((prev) =>
          prev.filter((v) => !(v.option_id === optionId && v.profile_id === meId))
        )
        await supabase.from('poll_votes').delete().match({ option_id: optionId, profile_id: meId })
      } else {
        const temp: PollVote = {
          id: tempId(),
          option_id: optionId,
          profile_id: meId,
          created_at: new Date().toISOString(),
        }
        setVotes((prev) => [...prev, temp])
        const { data, error } = await supabase
          .from('poll_votes')
          .insert({ option_id: optionId, profile_id: meId })
          .select()
          .single()
        if (!error && data) {
          setVotes((prev) => prev.map((v) => (v.id === temp.id ? (data as PollVote) : v)))
        } else if (error) {
          setVotes((prev) => prev.filter((v) => v.id !== temp.id))
        }
      }
    },
    [votesByOption]
  )

  const removeOption = useCallback(async (optionId: string) => {
    setOptions((prev) => prev.filter((o) => o.id !== optionId))
    setVotes((prev) => prev.filter((v) => v.option_id !== optionId))
    await supabase.from('poll_options').delete().eq('id', optionId)
  }, [])

  const value = useMemo<PollsContextValue>(
    () => ({ ready, getFor, hasVote, addOption, toggleVote, removeOption }),
    [ready, getFor, hasVote, addOption, toggleVote, removeOption]
  )

  return <PollsContext.Provider value={value}>{children}</PollsContext.Provider>
}

export function usePolls(): PollsContextValue {
  const ctx = useContext(PollsContext)
  if (!ctx) throw new Error('usePolls must be used within PollsProvider')
  return ctx
}
