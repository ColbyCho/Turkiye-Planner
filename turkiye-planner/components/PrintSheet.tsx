'use client'

import { ITINERARY } from '@/data/itinerary'
import { eventsFor, statsFor, type CrewName } from '@/lib/crew'
import { useCrewProfiles } from '@/lib/db/profiles'
import { formatRange, formatShortDate } from '@/lib/time'

/**
 * The one-pager: everything one person needs on paper, hidden on screen and
 * revealed by the print stylesheet in globals.css.
 */
export default function PrintSheet({ name }: { name: CrewName }) {
  const { profile: profileFor } = useCrewProfiles()
  const profile = profileFor(name)
  const events = eventsFor(name)
  const stats = statsFor(name)

  const byDay = events.reduce<{ date: string; items: typeof events }[]>((acc, event) => {
    const last = acc[acc.length - 1]
    if (last && last.date === event.day.date) last.items.push(event)
    else acc.push({ date: event.day.date, items: [event] })
    return acc
  }, [])

  const logistics = [
    profile.room && `Room: ${profile.room}`,
    profile.seatOut && `Out: ${profile.seatOut}`,
    profile.seatHome && `Home: ${profile.seatHome}`,
    profile.dietary && `Eats: ${profile.dietary}`,
  ].filter(Boolean)

  return (
    <div className="print-sheet hidden text-ink print:block">
      <header className="border-b-2 border-ink pb-2">
        <h1 className="font-display text-3xl font-semibold">
          {name}&rsquo;s Türkiye — August 21–31, 2026
        </h1>
        <p className="mt-1 text-sm">
          Istanbul &amp; Bodrum · {stats.activityCount} plans across {stats.dayCount}{' '}
          days
          {stats.firstDate && stats.lastDate && (
            <> · {formatShortDate(stats.firstDate)} → {formatShortDate(stats.lastDate)}</>
          )}
        </p>
        {logistics.length > 0 && (
          <p className="mt-1 text-sm">{logistics.join('  ·  ')}</p>
        )}
      </header>

      {byDay.map((group) => (
        <section key={group.date} className="mt-3 break-inside-avoid">
          <h2 className="font-display text-lg font-semibold">
            {formatShortDate(group.date)}
            <span className="ml-2 text-sm font-normal">
              {ITINERARY.find((d) => d.date === group.date)?.city}
            </span>
          </h2>
          <ul className="mt-0.5">
            {group.items.map(({ activity }) => (
              <li key={activity.id} className="flex gap-2 border-b border-dotted py-0.5 text-sm">
                <span className="w-32 shrink-0 tabular-nums">
                  {formatRange(activity.start, activity.end)}
                </span>
                <span className="flex-1">
                  {activity.title}
                  {activity.location && (
                    <span className="text-ink/60"> — {activity.location}</span>
                  )}
                </span>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  )
}
