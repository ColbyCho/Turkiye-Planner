'use client'

import { useEffect } from 'react'
import type { Activity, DayPlan } from '@/lib/types'
import { CATEGORIES } from '@/lib/categories'
import { formatDate, formatDuration, formatRange, toMinutes } from '@/lib/time'
import { downloadICS, googleCalendarUrl } from '@/lib/calendar'
import { CREW } from '@/data/itinerary'

// One fixed color per crew member so avatars stay consistent across the trip
const AVATAR_COLORS = [
  '#1E4B8E', // cobalt
  '#C1440E', // spice
  '#178A99', // turquoise
  '#A66E15', // saffron dark
  '#2C2A4A', // night
  '#8F7C5F', // kraft dark
  '#96340B', // spice dark
  '#0F6773', // turquoise dark
  '#565285', // night light
]

function avatarColor(name: string): string {
  const i = CREW.indexOf(name as (typeof CREW)[number])
  if (i >= 0) return AVATAR_COLORS[i % AVATAR_COLORS.length]
  // Fallback for guest names added later
  const hash = name.split('').reduce((h, ch) => h + ch.charCodeAt(0), 0)
  return AVATAR_COLORS[hash % AVATAR_COLORS.length]
}

interface ActivityModalProps {
  day: DayPlan
  activity: Activity
  onClose: () => void
}

export default function ActivityModal({ day, activity, onClose }: ActivityModalProps) {
  const cat = CATEGORIES[activity.category]
  const everyone = activity.participants.length === CREW.length

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-ink/60 p-4 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={activity.title}
    >
      <div
        className="relative max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-md border border-rule bg-paper-card p-6 shadow-page sm:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* tape strip */}
        <div
          className="absolute -top-2 left-1/2 h-5 w-28 -translate-x-1/2 -rotate-1 shadow-sm"
          style={{ backgroundColor: `${cat.accent}55` }}
          aria-hidden
        />

        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full text-lg text-ink/50 transition hover:bg-ink/10 hover:text-ink"
          aria-label="Close"
        >
          ✕
        </button>

        {/* Square photo (or emoji tile) — styled like the desk postcards */}
        <figure className="mx-auto mt-2 w-56 -rotate-1 bg-white p-1.5 pb-2 shadow-note transition-transform duration-300 hover:rotate-0 sm:w-64">
          {activity.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={activity.image.src}
              alt={activity.image.alt}
              className="aspect-square w-full object-cover"
            />
          ) : (
            <div
              className="flex aspect-square w-full items-center justify-center"
              style={{
                backgroundColor: `${cat.accent}1F`,
                backgroundImage: cat.pattern,
              }}
              role="img"
              aria-label={cat.label}
            >
              <span className="text-7xl sm:text-8xl" aria-hidden>
                {activity.emoji ?? cat.icon}
              </span>
            </div>
          )}
        </figure>
        {activity.image?.creditUrl && (
          <p className="mt-1.5 text-center text-[10px] text-ink/35">
            <a
              href={activity.image.creditUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-2 hover:text-ink/60"
            >
              {activity.image.creditName ?? 'source'}
            </a>
          </p>
        )}

        <span
          className={`mt-4 inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-medium ${cat.chip}`}
        >
          <span aria-hidden>{cat.icon}</span>
          {cat.label}
        </span>

        <h3 className="mt-3 font-display text-3xl font-semibold leading-tight">
          {activity.title}
        </h3>

        <p className="mt-2 text-sm font-medium text-ink/80">
          {formatDate(day.date)} · {formatRange(activity.start, activity.end)}
          {toMinutes(activity.end) > 24 * 60 && ' (next day)'}
          <span className="text-ink/50"> · {formatDuration(activity.start, activity.end)}</span>
        </p>

        {activity.location && (
          <p className="mt-1 text-sm text-ink/70">📍 {activity.location}</p>
        )}

        {activity.notes && (
          <p className="mt-4 border-l-2 pl-3 text-sm leading-relaxed text-ink/80"
             style={{ borderColor: cat.accent }}>
            {activity.notes}
          </p>
        )}

        {activity.url && (
          <a
            href={activity.url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex items-center gap-1.5 rounded border border-cobalt bg-cobalt/10 px-3 py-1.5 text-sm font-medium text-cobalt transition hover:bg-cobalt hover:text-paper"
          >
            Tickets / reservation ↗
          </a>
        )}

        {/* Who's in */}
        <div className="mt-5">
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-ink/50">
            Who&rsquo;s in {everyone && '— everyone!'}
          </p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {activity.participants.map((name) => (
              <span
                key={name}
                className="inline-flex items-center gap-1.5 rounded-full border border-rule bg-paper px-2 py-0.5 text-xs font-medium text-ink/80"
              >
                <span
                  className="flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-bold text-paper"
                  style={{ backgroundColor: avatarColor(name) }}
                  aria-hidden
                >
                  {name[0]}
                </span>
                {name}
              </span>
            ))}
          </div>
        </div>

        {/* Add to calendar */}
        <div className="mt-6 flex flex-wrap gap-2 border-t border-rule pt-4">
          <button
            type="button"
            onClick={() => downloadICS(day, activity)}
            className="rounded bg-spice px-3 py-1.5 text-sm font-medium text-paper transition hover:bg-spice-dark"
          >
            📥 Add to calendar (.ics)
          </button>
          <a
            href={googleCalendarUrl(day, activity)}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded border border-spice px-3 py-1.5 text-sm font-medium text-spice transition hover:bg-spice/10"
          >
            Google Calendar ↗
          </a>
        </div>
      </div>
    </div>
  )
}
