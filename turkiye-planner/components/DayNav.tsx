'use client'

import { useEffect, useRef } from 'react'
import { ITINERARY } from '@/data/itinerary'
import { tabParts } from '@/lib/time'

interface DayNavProps {
  currentIndex: number
  onSelect: (index: number) => void
}

function cityDot(city: string): string {
  const istanbul = city.includes('Istanbul')
  const bodrum = city.includes('Bodrum')
  if (istanbul && bodrum) return 'bg-gradient-to-r from-cobalt to-turquoise'
  return bodrum ? 'bg-turquoise' : 'bg-cobalt'
}

export default function DayNav({ currentIndex, onSelect }: DayNavProps) {
  const stripRef = useRef<HTMLDivElement>(null)
  const activeRef = useRef<HTMLButtonElement>(null)

  // Keep the active tab in view on narrow screens
  useEffect(() => {
    activeRef.current?.scrollIntoView({ block: 'nearest', inline: 'center' })
  }, [currentIndex])

  const arrowClasses =
    'flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-rule bg-paper-card text-xl shadow-block transition enabled:hover:bg-saffron-light/40 enabled:hover:border-saffron disabled:opacity-30'

  return (
    // -mb-px lets the active tab overlap the page card's top border so the
    // two read as one continuous piece of paper.
    <nav className="-mb-px flex items-end gap-2" aria-label="Trip days">
      <button
        type="button"
        className={`${arrowClasses} mb-1`}
        onClick={() => onSelect(currentIndex - 1)}
        disabled={currentIndex === 0}
        aria-label="Yesterday"
      >
        ‹
      </button>

      {/* Planner-style date tabs */}
      <div ref={stripRef} className="tab-strip flex flex-1 overflow-x-auto px-1">
        {/* mx-auto centers the tabs when they fit; scrolls without clipping when they don't.
            The raised look comes from extra padding on the active tab (not transforms),
            so the scroll container never clips anything. */}
        <div className="mx-auto flex items-end gap-1">
          {ITINERARY.map((day, i) => {
            const { weekday, day: dayNum } = tabParts(day.date)
            const active = i === currentIndex
            return (
              <button
                key={day.date}
                ref={active ? activeRef : undefined}
                type="button"
                onClick={() => onSelect(i)}
                aria-current={active ? 'date' : undefined}
                className={`flex shrink-0 flex-col items-center rounded-t-md px-3 transition ${
                  active
                    ? 'relative z-10 border border-b-0 border-rule bg-paper-card pb-2 pt-3'
                    : 'border border-rule/60 bg-paper-deep/70 pb-1.5 pt-2 opacity-70 hover:opacity-100'
                }`}
              >
                <span className="text-[10px] font-bold uppercase tracking-widest text-ink/50">
                  {weekday}
                </span>
                <span
                  className={`font-display text-xl font-semibold leading-none ${
                    active ? 'text-spice' : 'text-ink/70'
                  }`}
                >
                  {dayNum}
                </span>
                <span
                  className={`mt-1 h-1.5 w-1.5 rounded-full ${cityDot(day.city)}`}
                  aria-hidden
                />
              </button>
            )
          })}
        </div>
      </div>

      <button
        type="button"
        className={`${arrowClasses} mb-1`}
        onClick={() => onSelect(currentIndex + 1)}
        disabled={currentIndex === ITINERARY.length - 1}
        aria-label="Tomorrow"
      >
        ›
      </button>
    </nav>
  )
}
