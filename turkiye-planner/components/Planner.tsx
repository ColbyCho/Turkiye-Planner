'use client'

import { useCallback, useEffect, useState } from 'react'
import { ITINERARY } from '@/data/itinerary'
import type { Activity, Category } from '@/lib/types'
import { formatDate } from '@/lib/time'
import { CATEGORIES, CATEGORY_ORDER } from '@/lib/categories'
import DayNav from './DayNav'
import DayGrid from './DayGrid'
import ActivityModal from './ActivityModal'
import FunFact from './FunFact'
import Postcards from './Postcards'
import TurkishFlag from './TurkishFlag'
import NazarCharm from './NazarCharm'

export default function Planner() {
  const [dayIndex, setDayIndex] = useState(0)
  const [selected, setSelected] = useState<Activity | null>(null)
  const [activeCategories, setActiveCategories] = useState<Category[]>([])

  const toggleCategory = (c: Category) => {
    setActiveCategories((prev) =>
      prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]
    )
  }

  // Deep-link support: turkiye-planner.example#2026-08-25 opens that day
  useEffect(() => {
    const hash = window.location.hash.slice(1)
    const i = ITINERARY.findIndex((d) => d.date === hash)
    if (i >= 0) setDayIndex(i)
  }, [])

  const goTo = useCallback((i: number) => {
    const clamped = Math.max(0, Math.min(ITINERARY.length - 1, i))
    setDayIndex(clamped)
    setSelected(null)
    window.history.replaceState(null, '', `#${ITINERARY[clamped].date}`)
  }, [])

  // ← / → flip between days when the modal is closed
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (selected) return
      if (e.key === 'ArrowLeft') goTo(dayIndex - 1)
      if (e.key === 'ArrowRight') goTo(dayIndex + 1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [dayIndex, selected, goTo])

  const day = ITINERARY[dayIndex]

  return (
    <main className="relative mx-auto max-w-5xl px-3 py-8 sm:px-6 sm:py-12">
      <NazarCharm />

      {/* Trip masthead */}
      <header className="mb-8 text-center">
        <p className="mb-1 font-hand text-2xl text-spice">The Official</p>
        <h1 className="flex items-center justify-center gap-3 font-display text-4xl font-semibold tracking-wide sm:gap-4 sm:text-5xl md:text-6xl">
          <TurkishFlag className="h-7 w-auto drop-shadow-sm sm:h-9 md:h-10" />
          <span>Türkiye Planner</span>
        </h1>
        <p className="mt-2 text-sm uppercase tracking-[0.25em] text-ink/60">
          Istanbul ✶ Bodrum · August 21 – 31, 2026 · party of nine
        </p>
      </header>

      <DayNav currentIndex={dayIndex} onSelect={goTo} />

      {/* The planner page */}
      <section className="rounded-md border border-rule bg-paper-card shadow-page">
        {/* Day header */}
        <div className="flex flex-wrap items-start justify-between gap-4 border-b-2 border-rule px-5 pb-4 pt-6 sm:px-8">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-ink/50">
              Day {dayIndex + 1} of {ITINERARY.length}
            </p>
            <h2 className="font-display text-3xl font-semibold sm:text-4xl">
              {formatDate(day.date)}
            </h2>
            <p className="mt-1 font-hand text-2xl text-cobalt">{day.title}</p>
          </div>
          {/* Passport-style city stamp */}
          <div className="rotate-[4deg] rounded border-2 border-spice/70 px-3 py-1.5 text-center text-spice/80">
            <p className="text-[10px] font-bold uppercase tracking-[0.3em]">
              Türkiye · {day.date.slice(5).replace('-', '/')}
            </p>
            <p className="font-display text-lg font-bold uppercase tracking-widest">
              {day.city}
            </p>
          </div>
        </div>

        {/* Category legend — click to filter the grid by activity type */}
        <div className="flex flex-wrap items-center gap-2 px-5 py-3 sm:px-8">
          {CATEGORY_ORDER.map((c) => {
            const on = activeCategories.includes(c)
            const filtering = activeCategories.length > 0
            return (
              <button
                key={c}
                type="button"
                onClick={() => toggleCategory(c)}
                aria-pressed={on}
                title={on ? 'Click to stop filtering' : `Show only ${CATEGORIES[c].label.toLowerCase()}`}
                className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-medium transition ${CATEGORIES[c].chip} ${
                  on
                    ? 'ring-2 ring-spice ring-offset-1 ring-offset-paper-card'
                    : filtering
                      ? 'opacity-40 hover:opacity-100'
                      : 'hover:ring-1 hover:ring-ink/30'
                }`}
              >
                <span aria-hidden>{CATEGORIES[c].icon}</span>
                {CATEGORIES[c].label}
              </button>
            )
          })}
          {activeCategories.length > 0 && (
            <button
              type="button"
              onClick={() => setActiveCategories([])}
              className="text-[11px] font-medium text-spice underline underline-offset-2 hover:text-spice-dark"
            >
              clear filter
            </button>
          )}
        </div>

        <DayGrid day={day} onSelect={setSelected} activeCategories={activeCategories} />

        <FunFact fact={day.funFact} />
      </section>

      <footer className="mt-6 text-center text-xs text-ink/40">
        Tap any activity for details, links & add-to-calendar. Use ← → to flip days.
      </footer>

      <Postcards />

      {selected && (
        <ActivityModal
          day={day}
          activity={selected}
          onClose={() => setSelected(null)}
        />
      )}
    </main>
  )
}
