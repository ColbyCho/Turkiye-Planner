'use client'

import { useCallback, useEffect, useSyncExternalStore } from 'react'
import {
  getRows,
  refresh,
  remove,
  storeMode,
  subscribe,
  upsert,
  type StoreMode,
} from './store'
import type { TableMap, TableName } from './types'

/** Stable empty snapshot for the prerender pass — see below. */
const EMPTY: never[] = []

export interface TableHandle<K extends TableName> {
  rows: TableMap[K][]
  mode: StoreMode
  upsert: (row: TableMap[K]) => Promise<void>
  remove: (row: TableMap[K]) => Promise<void>
  refresh: () => Promise<void>
}

/**
 * Subscribe a component to one table.
 *
 * The page is prerendered at build time, so the server snapshot is always
 * empty and React swaps in the real rows right after hydration — that's what
 * keeps a localStorage-backed table from tripping a hydration mismatch.
 */
export function useTable<K extends TableName>(table: K): TableHandle<K> {
  const rows = useSyncExternalStore(
    useCallback((onChange: () => void) => subscribe(table, onChange), [table]),
    useCallback(() => getRows(table), [table]),
    useCallback(() => EMPTY as unknown as TableMap[K][], [])
  )

  useEffect(() => {
    refresh(table)
  }, [table])

  return {
    rows,
    mode: storeMode(),
    upsert: useCallback((row: TableMap[K]) => upsert(table, row), [table]),
    remove: useCallback((row: TableMap[K]) => remove(table, row), [table]),
    refresh: useCallback(() => refresh(table), [table]),
  }
}

/** Short random id for rows the UI creates (comments, proposals, polls…). */
export function newId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }
  return `id-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
}
