'use client'

import Link from 'next/link'
import { PACKING_TOTAL } from '@/data/packing'
import { useProfile } from '@/lib/useProfile'
import { usePackingCounts } from '@/lib/usePackingCounts'
import Avatar from './Avatar'

const TRIP_START = '2026-08-21'

/** Crew ranked by packing progress — crown on the leader, "you" highlighted. */
export default function PackingLeaderboard() {
  const { profiles, me } = useProfile()
  const { counts, ready } = usePackingCounts()

  if (!ready || profiles.length === 0) return null

  const ranked = [...profiles].sort(
    (a, b) =>
      (counts.get(b.id) ?? 0) - (counts.get(a.id) ?? 0) || a.name.localeCompare(b.name)
  )
  const leadCount = counts.get(ranked[0].id) ?? 0

  return (
    <section aria-label="Packing race" className="mx-auto mb-8 max-w-md">
      <p className="text-center font-hand text-2xl text-spice">The Packing Race</p>
      <ol className="mt-3 space-y-2">
        {ranked.map((p) => {
          const n = counts.get(p.id) ?? 0
          const pct = PACKING_TOTAL ? Math.round((n / PACKING_TOTAL) * 100) : 0
          const isMe = p.id === me?.id
          return (
            <li key={p.id} className="flex items-center gap-2.5">
              <Avatar profile={p} size={28} />
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-2 text-xs font-medium">
                  <span className={`truncate ${isMe ? 'font-bold text-spice' : 'text-ink/80'}`}>
                    {p.name}
                    {isMe && ' (you)'}
                    {n > 0 && n === leadCount && ' 👑'}
                  </span>
                  <span className="shrink-0 tabular-nums text-ink/50">
                    {n}/{PACKING_TOTAL}
                  </span>
                </div>
                <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-rule/40">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isMe ? 'bg-spice' : 'bg-turquoise'
                    }`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            </li>
          )
        })}
      </ol>
    </section>
  )
}

/**
 * One-line race teaser for the planner. Vanishes once the trip starts — from
 * then on the race only lives on the packing page.
 */
export function PackingTeaser() {
  const { profiles, me } = useProfile()
  const { counts, ready } = usePackingCounts()

  if (new Date().toLocaleDateString('en-CA') >= TRIP_START) return null
  if (!ready || profiles.length === 0) return null

  const leader = [...profiles].sort(
    (a, b) => (counts.get(b.id) ?? 0) - (counts.get(a.id) ?? 0)
  )[0]
  const leadCount = counts.get(leader.id) ?? 0
  const pct = (id: string) =>
    PACKING_TOTAL ? Math.round(((counts.get(id) ?? 0) / PACKING_TOTAL) * 100) : 0

  return (
    <p className="mt-4 text-sm text-ink/60">
      🧳 The packing race is on
      {leadCount > 0 && (
        <>
          {' '}
          — <span className="font-semibold">👑 {leader.name}</span> leads at {pct(leader.id)}%
          {me && me.id !== leader.id && <>, you&rsquo;re at {pct(me.id)}%</>}
        </>
      )}
      .{' '}
      <Link
        href="/packing"
        className="font-semibold text-spice underline underline-offset-2 hover:text-spice-dark"
      >
        See the board
      </Link>
    </p>
  )
}
