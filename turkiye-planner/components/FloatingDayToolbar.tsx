'use client'

import { useEffect, useRef, useState, type RefObject } from 'react'
import { ITINERARY } from '@/data/itinerary'
import { tabParts } from '@/lib/time'

interface FloatingDayToolbarProps {
  currentIndex: number
  onSelect: (index: number) => void
  /** Element whose visibility gates the toolbar — the top day tabs. */
  watch: RefObject<HTMLElement>
}

function dayLabel(index: number): string {
  const { weekday, day } = tabParts(ITINERARY[index].date)
  return `${weekday} ${day}`
}

export default function FloatingDayToolbar({
  currentIndex,
  onSelect,
  watch,
}: FloatingDayToolbarProps) {
  // Show only once the top tabs have scrolled out of view above the fold.
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = watch.current
    if (!el) return
    const io = new IntersectionObserver(
      ([entry]) => {
        // Visible only when the tabs are gone AND we've scrolled past them
        // (not when they're still below, before the user scrolls).
        setVisible(!entry.isIntersecting && entry.boundingClientRect.top < 0)
      },
      { threshold: 0 }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [watch])

  const hasPrev = currentIndex > 0
  const hasNext = currentIndex < ITINERARY.length - 1

  const edgeButton =
    'flex items-center gap-1.5 rounded-full border border-rule bg-paper-card px-3 py-2 text-sm font-semibold text-ink/80 shadow-block transition enabled:hover:border-saffron enabled:hover:bg-saffron-light/40 disabled:opacity-30 sm:px-4'

  return (
    <div
      className={`fixed inset-x-0 bottom-0 z-40 flex justify-center px-3 pb-[calc(env(safe-area-inset-bottom,0px)+0.75rem)] transition-all duration-300 ${
        visible
          ? 'translate-y-0 opacity-100'
          : 'pointer-events-none translate-y-6 opacity-0'
      }`}
      aria-hidden={!visible}
    >
      <nav
        className="flex items-center gap-2 rounded-full border border-rule bg-paper-card/95 p-1.5 shadow-page backdrop-blur-sm"
        aria-label="Jump between days"
      >
        <button
          type="button"
          className={edgeButton}
          onClick={() => onSelect(currentIndex - 1)}
          disabled={!hasPrev}
          aria-label={hasPrev ? `Previous day — ${dayLabel(currentIndex - 1)}` : 'No previous day'}
        >
          <span aria-hidden className="text-lg leading-none">‹</span>
          <span className="tabular-nums">{hasPrev ? dayLabel(currentIndex - 1) : '—'}</span>
        </button>

        <button
          type="button"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-cobalt bg-cobalt text-lg text-paper shadow-block transition hover:bg-cobalt-light"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          aria-label="Back to top"
          title="Back to top"
        >
          <span aria-hidden className="leading-none">↑</span>
        </button>

        <button
          type="button"
          className={edgeButton}
          onClick={() => onSelect(currentIndex + 1)}
          disabled={!hasNext}
          aria-label={hasNext ? `Next day — ${dayLabel(currentIndex + 1)}` : 'No next day'}
        >
          <span className="tabular-nums">{hasNext ? dayLabel(currentIndex + 1) : '—'}</span>
          <span aria-hidden className="text-lg leading-none">›</span>
        </button>
      </nav>
    </div>
  )
}
