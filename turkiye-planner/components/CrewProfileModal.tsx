'use client'

import { useMemo } from 'react'
import type { Activity } from '@/lib/types'
import { useModalChrome } from '@/lib/useModalChrome'
import { CATEGORIES } from '@/lib/categories'
import { avatarColor, eventsFor, profileFor, statsFor, type CrewName } from '@/lib/crew'
import { formatRange, formatShortDate } from '@/lib/time'
import { useIdentity } from './IdentityProvider'

interface CrewProfileModalProps {
  name: CrewName
  onClose: () => void
  /** Jump the planner to one of their activities. */
  onOpenActivity: (dayIndex: number, activity: Activity) => void
}

/** A labeled row in the passport data block. Renders nothing without a value. */
function Field({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null
  return (
    <div className="flex gap-3 border-b border-dashed border-rule/70 py-1.5 last:border-0">
      <dt className="w-24 shrink-0 text-[10px] font-bold uppercase tracking-[0.15em] text-ink/45">
        {label}
      </dt>
      <dd className="text-sm leading-snug text-ink/80">{value}</dd>
    </div>
  )
}

function Stat({ value, label }: { value: string | number; label: string }) {
  return (
    <div className="flex-1 text-center">
      <p className="font-display text-2xl font-semibold leading-none">{value}</p>
      <p className="mt-1 text-[10px] font-medium uppercase tracking-[0.15em] text-ink/45">
        {label}
      </p>
    </div>
  )
}

export default function CrewProfileModal({
  name,
  onClose,
  onOpenActivity,
}: CrewProfileModalProps) {
  const { me, setMe } = useIdentity()
  const profile = profileFor(name)
  const stats = useMemo(() => statsFor(name), [name])
  const events = useMemo(() => eventsFor(name), [name])
  const color = avatarColor(name)
  const isMe = me === name

  useModalChrome(onClose)

  const onTrip =
    stats.firstDate && stats.lastDate
      ? `${formatShortDate(stats.firstDate)} → ${formatShortDate(stats.lastDate)}`
      : null

  // Group the event list by day so it reads like their copy of the itinerary.
  const byDay = events.reduce<{ dayIndex: number; date: string; items: typeof events }[]>(
    (acc, event) => {
      const last = acc[acc.length - 1]
      if (last && last.dayIndex === event.dayIndex) last.items.push(event)
      else acc.push({ dayIndex: event.dayIndex, date: event.day.date, items: [event] })
      return acc
    },
    []
  )

  return (
    <div
      className="fixed inset-0 z-[65] flex items-center justify-center bg-ink/60 p-4 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`${name}'s profile`}
    >
      <div
        className="relative max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-md border border-rule bg-paper-card p-6 shadow-page sm:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* tape strip */}
        <div
          className="absolute -top-2 left-1/2 h-5 w-28 -translate-x-1/2 -rotate-1 shadow-sm"
          style={{ backgroundColor: `${color}55` }}
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

        {/* Polaroid */}
        <figure className="mx-auto mt-2 w-44 -rotate-2 bg-white p-1.5 pb-2 shadow-note transition-transform duration-300 hover:rotate-0 sm:w-52">
          {profile.photo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={profile.photo}
              alt={name}
              className="aspect-square w-full object-cover"
            />
          ) : (
            <div
              className="flex aspect-square w-full items-center justify-center font-display text-7xl font-semibold text-paper"
              style={{ backgroundColor: color }}
              role="img"
              aria-label={name}
            >
              {name[0]}
            </div>
          )}
          <figcaption className="pt-1.5 text-center font-hand text-xl leading-tight text-ink/70">
            {profile.quote ?? name}
          </figcaption>
        </figure>

        <div className="mt-4 text-center">
          <h3 className="font-display text-3xl font-semibold leading-tight">{name}</h3>
          {profile.title && (
            <p className="mt-0.5 text-[11px] font-bold uppercase tracking-[0.2em] text-ink/50">
              {profile.title}
            </p>
          )}
          {isMe ? (
            <span className="mt-2 inline-block rounded-full border border-spice bg-spice/10 px-2.5 py-0.5 text-[11px] font-medium text-spice">
              this is you
            </span>
          ) : (
            <button
              type="button"
              onClick={() => setMe(name)}
              className="mt-2 rounded-full border border-rule bg-paper px-2.5 py-0.5 text-[11px] font-medium text-ink/60 transition hover:border-ink/40 hover:text-ink"
            >
              this is me
            </button>
          )}
        </div>

        {/* Auto-computed from the itinerary — no data entry needed */}
        <div className="mt-5 flex items-start gap-2 rounded border border-rule bg-paper px-3 py-3">
          <Stat value={stats.activityCount} label="plans" />
          <div className="w-px self-stretch bg-rule" aria-hidden />
          <Stat value={stats.dayCount} label="days" />
          <div className="w-px self-stretch bg-rule" aria-hidden />
          <Stat value={`${stats.hours}h`} label="booked" />
        </div>

        <dl className="mt-4">
          <Field label="On trip" value={onTrip} />
          <Field label="Home" value={profile.homeCity} />
          <Field label="Known for" value={profile.knownFor} />
          <Field label="Eats" value={profile.dietary} />
          <Field
            label="Mostly doing"
            value={stats.topCategory ? CATEGORIES[stats.topCategory].label : null}
          />
          <Field label="Fun fact" value={profile.funFact} />
        </dl>

        {/* Their copy of the itinerary */}
        <div className="mt-5">
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-ink/50">
            {isMe ? 'Your plans' : `${name}'s plans`}
          </p>
          {byDay.length === 0 ? (
            <p className="mt-2 text-sm text-ink/50">Not on anything yet.</p>
          ) : (
            <div className="mt-2 max-h-64 space-y-3 overflow-y-auto pr-1">
              {byDay.map((group) => (
                <div key={group.date}>
                  <p className="sticky top-0 bg-paper-card py-0.5 font-hand text-lg text-cobalt">
                    {formatShortDate(group.date)}
                  </p>
                  <ul className="space-y-1">
                    {group.items.map(({ activity }) => (
                      <li key={activity.id}>
                        <button
                          type="button"
                          onClick={() => onOpenActivity(group.dayIndex, activity)}
                          className="flex w-full items-baseline gap-2 rounded px-1.5 py-1 text-left transition hover:bg-ink/5"
                        >
                          <span aria-hidden>{CATEGORIES[activity.category].icon}</span>
                          <span className="flex-1 truncate text-sm text-ink/85">
                            {activity.title}
                          </span>
                          <span className="shrink-0 text-[11px] tabular-nums text-ink/45">
                            {formatRange(activity.start, activity.end)}
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
