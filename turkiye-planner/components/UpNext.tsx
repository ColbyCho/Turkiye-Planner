'use client'

import { useEffect, useMemo, useState } from 'react'
import { ITINERARY } from '@/data/itinerary'
import { eventsFor } from '@/lib/crew'
import { formatMinutes, formatShortDate, toMinutes } from '@/lib/time'
import { CATEGORIES } from '@/lib/categories'
import { useIdentity } from './IdentityProvider'

/** Where the trip actually is, in Türkiye time — not wherever the reader is. */
function istanbulNow(): { date: string; minutes: number } {
  const now = new Date()
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Istanbul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).formatToParts(now)
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? '00'
  return {
    date: `${get('year')}-${get('month')}-${get('day')}`,
    minutes: Number(get('hour')) * 60 + Number(get('minute')),
  }
}

interface UpNextProps {
  /** Jump the planner to the activity. */
  onOpen: (dayIndex: number, activityId: string) => void
}

/**
 * "What's next for you" — during the trip, your current or next plan; before
 * it, the first thing waiting when you land.
 */
export default function UpNext({ onOpen }: UpNextProps) {
  const { me, ready, requireMe } = useIdentity()
  const [clock, setClock] = useState<{ date: string; minutes: number } | null>(null)

  // Clock reads happen after mount (the page is prerendered) and tick slowly —
  // a minute's precision is plenty for "what's next".
  useEffect(() => {
    setClock(istanbulNow())
    const timer = setInterval(() => setClock(istanbulNow()), 60_000)
    return () => clearInterval(timer)
  }, [])

  const upcoming = useMemo(() => {
    if (!me || !clock) return null
    const events = eventsFor(me)
    if (events.length === 0) return null

    const live = events.find(
      (e) =>
        e.day.date === clock.date &&
        toMinutes(e.activity.start) <= clock.minutes &&
        toMinutes(e.activity.end) > clock.minutes
    )
    if (live) return { event: live, state: 'now' as const }

    const next = events.find(
      (e) =>
        e.day.date > clock.date ||
        (e.day.date === clock.date && toMinutes(e.activity.start) > clock.minutes)
    )
    if (next) {
      const state = next.day.date === clock.date ? ('today' as const) : ('later' as const)
      return { event: next, state }
    }
    return null
  }, [me, clock])

  if (!ready) return <div className="mb-4 h-9" aria-hidden />

  if (!me) {
    return (
      <div className="mb-4 text-center">
        <button
          type="button"
          onClick={() => requireMe('So we can show what’s next for you.', () => {})}
          className="inline-flex items-center gap-1.5 rounded-full border border-dashed border-turquoise-dark/60 bg-turquoise/5 px-3 py-1 text-xs font-medium text-turquoise-dark transition hover:bg-turquoise/15"
        >
          <span aria-hidden>⏱️</span> See what’s next for you
        </button>
      </div>
    )
  }

  if (!upcoming) return null

  const { event, state } = upcoming
  const cat = CATEGORIES[event.activity.category]
  const lead =
    state === 'now'
      ? 'Right now'
      : state === 'today'
        ? `Later today · ${formatMinutes(toMinutes(event.activity.start))}`
        : `${formatShortDate(event.day.date)} · ${formatMinutes(toMinutes(event.activity.start))}`

  return (
    <button
      type="button"
      onClick={() => onOpen(event.dayIndex, event.activity.id)}
      className="mb-4 flex w-full items-center gap-3 rounded-md border border-rule bg-paper-card px-4 py-2.5 text-left shadow-block transition hover:-translate-y-px hover:shadow-note"
    >
      <span className="text-xl" aria-hidden>
        {event.activity.emoji ?? cat.icon}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[10px] font-bold uppercase tracking-[0.2em] text-spice">
          {state === 'now' ? 'Up now' : 'Up next'} for {me}
        </span>
        <span className="block truncate text-sm font-semibold text-ink">
          {event.activity.title}
        </span>
        <span className="block truncate text-[11px] text-ink/50">
          {lead}
          {event.activity.location && ` · ${event.activity.location}`}
        </span>
      </span>
      <span className="shrink-0 text-xs text-ink/30" aria-hidden>
        →
      </span>
    </button>
  )
}
