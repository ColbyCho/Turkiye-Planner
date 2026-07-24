'use client'

import { deleteRow, isConnected, selectAll, upsertRow } from './client'
import { PRIMARY_KEYS, type TableMap, type TableName } from './types'

// ─────────────────────────────────────────────────────────────────────────────
// The shared-data store.
//
// One API, two backends. With Supabase credentials the rows are shared by
// everyone; without them each browser keeps its own copy in localStorage, so
// every feature is fully usable (and testable) before the database exists.
// Nothing above this file knows which mode it's in — see `storeMode()` for the
// one place the UI says so out loud.
//
// Writes are optimistic: the cache updates and re-renders immediately, then
// persists. A failed write rolls back and rethrows.
// ─────────────────────────────────────────────────────────────────────────────

const LOCAL_PREFIX = 'turkiye-planner.db.'
/** How often a connected tab re-reads shared tables while it's visible. */
const POLL_MS = 20_000

type Rows<K extends TableName> = TableMap[K][]

const cache = new Map<TableName, unknown[]>()
const listeners = new Map<TableName, Set<() => void>>()
const inFlight = new Map<TableName, Promise<void>>()
let pollTimer: ReturnType<typeof setInterval> | null = null

export type StoreMode = 'shared' | 'local'

export function storeMode(): StoreMode {
  return isConnected() ? 'shared' : 'local'
}

function readLocal<K extends TableName>(table: K): Rows<K> {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(LOCAL_PREFIX + table)
    return raw ? (JSON.parse(raw) as Rows<K>) : []
  } catch {
    return []
  }
}

function writeLocal<K extends TableName>(table: K, rows: Rows<K>): void {
  try {
    window.localStorage.setItem(LOCAL_PREFIX + table, JSON.stringify(rows))
  } catch (err) {
    // Quota — most likely a pile of local-mode photos. Surface it: the caller
    // turns this into a message rather than silently losing the write.
    throw new Error(
      'This device is out of local storage. Connect the database, or clear some local photos.'
    )
  }
}

function samePrimaryKey<K extends TableName>(
  table: K,
  a: TableMap[K],
  b: TableMap[K]
): boolean {
  return PRIMARY_KEYS[table].every(
    (col) => (a as never)[col] === (b as never)[col]
  )
}

function emit(table: TableName): void {
  listeners.get(table)?.forEach((fn) => fn())
}

function setCache<K extends TableName>(table: K, rows: Rows<K>): void {
  cache.set(table, rows)
  emit(table)
}

/** Current rows — the cache, seeded from localStorage on first read. */
export function getRows<K extends TableName>(table: K): Rows<K> {
  const cached = cache.get(table) as Rows<K> | undefined
  if (cached) return cached
  const seed = readLocal(table)
  cache.set(table, seed)
  return seed
}

/** Re-read from the database. A no-op in local mode. */
export async function refresh<K extends TableName>(table: K): Promise<void> {
  if (!isConnected()) return
  const existing = inFlight.get(table)
  if (existing) return existing

  const run = (async () => {
    try {
      setCache(table, await selectAll(table))
    } catch (err) {
      // A dropped connection shouldn't blank the screen — keep showing the
      // last known rows and try again on the next tick.
      console.warn(`[db] refresh ${table} failed`, err)
    } finally {
      inFlight.delete(table)
    }
  })()

  inFlight.set(table, run)
  return run
}

export async function upsert<K extends TableName>(
  table: K,
  row: TableMap[K]
): Promise<void> {
  const before = getRows(table)
  const next = [...before.filter((r) => !samePrimaryKey(table, r, row)), row]
  setCache(table, next)

  try {
    if (isConnected()) await upsertRow(table, row)
    else writeLocal(table, next)
  } catch (err) {
    setCache(table, before)
    throw err
  }
}

export async function remove<K extends TableName>(
  table: K,
  row: TableMap[K]
): Promise<void> {
  const before = getRows(table)
  const next = before.filter((r) => !samePrimaryKey(table, r, row))
  setCache(table, next)

  try {
    if (isConnected()) await deleteRow(table, row)
    else writeLocal(table, next)
  } catch (err) {
    setCache(table, before)
    throw err
  }
}

function ensurePolling(): void {
  if (pollTimer || !isConnected() || typeof window === 'undefined') return
  const tick = () => {
    if (document.visibilityState !== 'visible') return
    listeners.forEach((set, table) => set.size > 0 && refresh(table))
  }
  pollTimer = setInterval(tick, POLL_MS)
  window.addEventListener('focus', tick)
}

export function subscribe(table: TableName, onChange: () => void): () => void {
  const set = listeners.get(table) ?? new Set()
  set.add(onChange)
  listeners.set(table, set)
  ensurePolling()
  return () => {
    set.delete(onChange)
  }
}
