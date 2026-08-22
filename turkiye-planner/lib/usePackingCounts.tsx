'use client'

import { useEffect, useMemo, useState } from 'react'
import { supabase, type PackingCheck } from './supabase'

type CheckRow = Pick<PackingCheck, 'profile_id' | 'item_id'>

/**
 * Everyone's packing progress: item counts per profile, live. Read-only —
 * checking items stays in usePacking (own rows only). Counts arrive empty and
 * fill in; a fetch failure just leaves everyone at zero.
 */
export function usePackingCounts(): { counts: Map<string, number>; ready: boolean } {
  const [rows, setRows] = useState<CheckRow[]>([])
  const [ready, setReady] = useState(false)

  useEffect(() => {
    let alive = true
    supabase
      .from('packing_checks')
      .select('profile_id, item_id')
      .then(({ data }) => {
        if (!alive) return
        if (data) setRows(data as CheckRow[])
        setReady(true)
      })

    const same = (a: CheckRow, b: Partial<CheckRow>) =>
      a.profile_id === b.profile_id && a.item_id === b.item_id

    const channel = supabase
      .channel('packing-race-realtime')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'packing_checks' },
        (payload) => {
          const r = payload.new as CheckRow
          setRows((prev) => (prev.some((x) => same(x, r)) ? prev : [...prev, r]))
        }
      )
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'packing_checks' },
        (payload) => {
          const r = payload.old as Partial<CheckRow>
          // Old-row data can be partial depending on replica identity; skip
          // rather than mis-filter. Worst case a count is stale until reload.
          if (!r.profile_id || !r.item_id) return
          setRows((prev) => prev.filter((x) => !same(x, r)))
        }
      )
      .subscribe()

    return () => {
      alive = false
      supabase.removeChannel(channel)
    }
  }, [])

  const counts = useMemo(() => {
    const m = new Map<string, number>()
    for (const r of rows) m.set(r.profile_id, (m.get(r.profile_id) ?? 0) + 1)
    return m
  }, [rows])

  return { counts, ready }
}
