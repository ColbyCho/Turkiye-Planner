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
import { supabase, type CommentRow } from './supabase'

interface CommentsContextValue {
  /** false until the comments table answers; stays false if the SQL hasn't run. */
  available: boolean
  /** Comments for one target (activity id or day date), oldest first. */
  getFor: (target: string) => CommentRow[]
  post: (target: string, meId: string, body: string) => Promise<void>
  remove: (id: string) => Promise<void>
}

const CommentsContext = createContext<CommentsContextValue | null>(null)

function tempId(): string {
  try {
    return `temp-${crypto.randomUUID()}`
  } catch {
    return `temp-${Math.random().toString(36).slice(2)}`
  }
}

export function CommentsProvider({ children }: { children: ReactNode }) {
  const [rows, setRows] = useState<CommentRow[]>([])
  const [available, setAvailable] = useState(false)

  useEffect(() => {
    let alive = true
    supabase
      .from('comments')
      .select('*')
      .order('created_at')
      .then(({ data, error }) => {
        if (!alive) return
        if (error) return // table not created yet
        setRows((data ?? []) as CommentRow[])
        setAvailable(true)
      })

    const channel = supabase
      .channel('comments-realtime')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'comments' },
        (payload) => {
          const r = payload.new as CommentRow
          setRows((prev) => (prev.some((x) => x.id === r.id) ? prev : [...prev, r]))
        }
      )
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'comments' },
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

  const byTarget = useMemo(() => {
    const m = new Map<string, CommentRow[]>()
    for (const r of rows) {
      const list = m.get(r.target)
      if (list) list.push(r)
      else m.set(r.target, [r])
    }
    for (const list of Array.from(m.values())) {
      list.sort((a, b) => a.created_at.localeCompare(b.created_at))
    }
    return m
  }, [rows])

  const getFor = useCallback(
    (target: string) => byTarget.get(target) ?? [],
    [byTarget]
  )

  const post = useCallback(async (target: string, meId: string, body: string) => {
    const clean = body.trim().slice(0, 1000)
    if (!clean) return
    const temp: CommentRow = {
      id: tempId(),
      target,
      profile_id: meId,
      body: clean,
      created_at: new Date().toISOString(),
    }
    setRows((prev) => [...prev, temp])
    const { data, error } = await supabase
      .from('comments')
      .insert({ target, profile_id: meId, body: clean })
      .select()
      .single()
    if (!error && data) {
      setRows((prev) => prev.map((r) => (r.id === temp.id ? (data as CommentRow) : r)))
    } else {
      setRows((prev) => prev.filter((r) => r.id !== temp.id))
    }
  }, [])

  const remove = useCallback(async (id: string) => {
    setRows((prev) => prev.filter((r) => r.id !== id))
    await supabase.from('comments').delete().eq('id', id)
  }, [])

  const value = useMemo<CommentsContextValue>(
    () => ({ available, getFor, post, remove }),
    [available, getFor, post, remove]
  )

  return <CommentsContext.Provider value={value}>{children}</CommentsContext.Provider>
}

export function useComments(): CommentsContextValue {
  const ctx = useContext(CommentsContext)
  if (!ctx) throw new Error('useComments must be used within CommentsProvider')
  return ctx
}
