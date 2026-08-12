'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { supabase } from './supabase'

/**
 * Per-user packing checkmarks. Each profile has its own private set of checked
 * item ids in the `packing_checks` table (existence of a row = checked). Only
 * the signed-in user's own rows are ever fetched, so lists stay independent.
 */
export function usePacking(meId: string | null) {
  const [checked, setChecked] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  // Mirror of `checked` for stable reads inside callbacks.
  const checkedRef = useRef(checked)
  checkedRef.current = checked

  useEffect(() => {
    if (!meId) {
      setChecked(new Set())
      setLoading(false)
      return
    }
    let alive = true
    setLoading(true)
    supabase
      .from('packing_checks')
      .select('item_id')
      .eq('profile_id', meId)
      .then(({ data }) => {
        if (!alive) return
        setChecked(new Set((data ?? []).map((r) => (r as { item_id: string }).item_id)))
        setLoading(false)
      })
    return () => {
      alive = false
    }
  }, [meId])

  const toggle = useCallback(
    async (itemId: string) => {
      if (!meId) return
      const willCheck = !checkedRef.current.has(itemId)
      // optimistic
      setChecked((prev) => {
        const next = new Set(prev)
        if (willCheck) next.add(itemId)
        else next.delete(itemId)
        return next
      })
      const { error } = willCheck
        ? await supabase.from('packing_checks').upsert({ profile_id: meId, item_id: itemId })
        : await supabase.from('packing_checks').delete().match({ profile_id: meId, item_id: itemId })
      if (error) {
        // revert on failure
        setChecked((prev) => {
          const next = new Set(prev)
          if (willCheck) next.delete(itemId)
          else next.add(itemId)
          return next
        })
      }
    },
    [meId]
  )

  return { checked, loading, toggle }
}
