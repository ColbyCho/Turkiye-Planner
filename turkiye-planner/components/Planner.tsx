'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { ITINERARY } from '@/data/itinerary'
import type { Activity, Category, DayPlan } from '@/lib/types'
import { formatDate, formatDateShort } from '@/lib/time'
import { CATEGORIES, CATEGORY_ORDER } from '@/lib/categories'
import DayNav from './DayNav'
import DayGrid from './DayGrid'
import DayWeather from './DayWeather'
import ActivityModal from './ActivityModal'
import FunFact from './FunFact'
import HelpfulStuff from './HelpfulStuff'
import Countdown from './Countdown'
import Postcards from './Postcards'
import FloatingDayToolbar from './FloatingDayToolbar'
import TurkishFlag from './TurkishFlag'
import NazarCharm from './NazarCharm'
import { ProfileProvider } from '@/lib/useProfile'
import { ReactionsProvider } from '@/lib/useReactions'
import { PollsProvider } from '@/lib/usePolls'
import { SignupsProvider } from '@/lib/useSignups'
import { CommentsProvider } from '@/lib/useComments'
import { DayChat } from './CommentThread'
import ProfileGate from './ProfileGate'
import ProfileBadge from './ProfileBadge'

export default function Planner() {
  const [dayIndex, setDayIndex] = useState(0)
  const [selected, setSelected] = useState<Activity | null>(null)
  const [activeCategories, setActiveCategories] = useState<Category[]>([])
  const navRef = useRef<HTMLDivElement>(null)

  const toggleCategory = (c: Category) => {
    setActiveCategories((prev) =>
      prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]
    )
  }

  // Deep-link support:
  //   #2026-08-25          → opens that day
  //   #activity=d3-bazaar  → jumps to the day and opens that activity
  useEffect(() => {
    const hash = window.location.hash.slice(1)
    if (!hash) {
      // No deep link: once the trip is underway, land on today's page instead
      // of Day 1. Device-local date is the right clock — phones follow the
      // crew from Boston time into Türkiye time.
      const todayISO = new Date().toLocaleDateString('en-CA')
      const t = ITINERARY.findIndex((d) => d.date === todayISO)
      if (t >= 0) setDayIndex(t)
      return
    }
    if (hash.startsWith('activity=')) {
      const id = decodeURIComponent(hash.slice('activity='.length))
      for (let i = 0; i < ITINERARY.length; i++) {
        const a = ITINERARY[i].activities.find((x) => x.id === id)
        if (a) {
          setDayIndex(i)
          setSelected(a)
          return
        }
      }
      return
    }
    const i = ITINERARY.findIndex((d) => d.date === hash)
    if (i >= 0) setDayIndex(i)
  }, [])

  // Keep the URL in sync so the address bar always reflects what's on screen:
  // an open activity gets a shareable #activity=… hash, otherwise the day.
  // Skipped on the mount commit — the deep-link effect above hasn't applied
  // its setState yet, and writing here first would clobber the incoming hash.
  const syncedOnce = useRef(false)
  useEffect(() => {
    if (!syncedOnce.current) {
      syncedOnce.current = true
      return
    }
    const target = selected ? `#activity=${selected.id}` : `#${ITINERARY[dayIndex].date}`
    if (window.location.hash !== target) {
      window.history.replaceState(null, '', target)
    }
  }, [selected, dayIndex])

  const goTo = useCallback((i: number) => {
    const clamped = Math.max(0, Math.min(ITINERARY.length - 1, i))
    setDayIndex(clamped)
    setSelected(null)
    window.history.replaceState(null, '', `#${ITINERARY[clamped].date}`)
    // Switching days is a context change — bring the new day into view from
    // the top rather than stranding the reader mid-grid.
    window.scrollTo({ top: 0 })
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
    <ProfileProvider>
      <ReactionsProvider>
        <PollsProvider>
          <SignupsProvider>
            <CommentsProvider>
              <PlannerInner
              dayIndex={dayIndex}
              setSelected={setSelected}
              selected={selected}
              activeCategories={activeCategories}
              setActiveCategories={setActiveCategories}
              toggleCategory={toggleCategory}
              goTo={goTo}
              navRef={navRef}
              day={day}
              />
            </CommentsProvider>
          </SignupsProvider>
        </PollsProvider>
      </ReactionsProvider>
    </ProfileProvider>
  )
}

function PlannerInner({
  dayIndex,
  selected,
  setSelected,
  activeCategories,
  setActiveCategories,
  toggleCategory,
  goTo,
  navRef,
  day,
}: {
  dayIndex: number
  selected: Activity | null
  setSelected: (a: Activity | null) => void
  activeCategories: Category[]
  setActiveCategories: (c: Category[]) => void
  toggleCategory: (c: Category) => void
  goTo: (i: number) => void
  navRef: React.RefObject<HTMLDivElement>
  day: DayPlan
}) {
  return (
    <main className="relative mx-auto max-w-5xl px-3 py-8 pb-28 sm:px-6 sm:py-12 sm:pb-28">
      <ProfileGate />
      <NazarCharm />

      {/* Trip masthead */}
      <header className="mb-8 text-center">
        <p className="mb-1 font-hand text-2xl text-spice">The Official</p>
        <h1 className="flex items-center justify-center gap-3 font-display text-4xl font-semibold tracking-wide sm:gap-4 sm:text-5xl md:text-6xl">
          <TurkishFlag className="h-7 w-auto drop-shadow-sm sm:h-9 md:h-10" />
          <span>Türkiye Planner</span>
        </h1>
        <p className="mt-2 text-sm uppercase tracking-[0.25em] text-ink/60">
          Istanbul ✶ Bodrum · August 21 – 31, 2026 · party of eight
        </p>
        <Countdown variant="inline" />
        <div>
          <ProfileBadge />
        </div>
      </header>

      <div ref={navRef}>
        <DayNav currentIndex={dayIndex} onSelect={goTo} />
      </div>

      {/* The planner page */}
      <section className="rounded-md border border-rule bg-paper-card shadow-page">
        {/* Day header */}
        <div className="flex items-start justify-between gap-3 border-b-2 border-rule px-5 pb-4 pt-5 sm:gap-6 sm:px-8 sm:pt-6">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-ink/50">
              Day {dayIndex + 1} of {ITINERARY.length}
            </p>
            {/* Never break the date across lines — it sets how much room the
                stamp beside it gets, and a hyphenated date reads terribly. */}
            <h2 className="whitespace-nowrap font-display text-3xl font-semibold sm:text-4xl">
              <span className="sm:hidden">{formatDateShort(day.date)}</span>
              <span className="hidden sm:inline">{formatDate(day.date)}</span>
            </h2>
            <p className="mt-1 font-hand text-2xl text-cobalt">{day.title}</p>
          </div>
          {/* The day's forecast, then its passport-style city stamp. Both ride
              in the slack beside the date block, so they cost no extra height.
              On a transfer day the stamp stacks its two cities on phones. */}
          <div className="flex flex-col items-end gap-1.5">
            <DayWeather day={day} />
            <div className="rotate-[4deg] rounded border-2 border-spice/70 px-2.5 py-1 text-center text-spice/80 sm:px-3 sm:py-1.5">
              <p className="whitespace-nowrap text-[9px] font-bold uppercase tracking-[0.2em] sm:text-[10px] sm:tracking-[0.3em]">
                Türkiye · {day.date.slice(5).replace('-', '/')}
              </p>
              <p className="font-display text-base font-bold uppercase leading-tight tracking-wider sm:text-lg sm:tracking-widest">
                {day.city
                  .split('→')
                  .map((c) => c.trim())
                  .map((city, i) => (
                    <span key={city} className={i > 0 ? 'block sm:inline' : undefined}>
                      {i > 0 && <span className="mx-1 font-sans font-normal">→</span>}
                      {city}
                    </span>
                  ))}
              </p>
            </div>
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

        <DayChat date={day.date} dayTitle={day.title} />

        <HelpfulStuff />
      </section>

      <footer className="mt-6 text-center text-xs text-ink/40">
        Tap any activity for details, links & add-to-calendar. Use ← → to flip days.
      </footer>

      <Postcards date={day.date} />

      {selected && (
        <ActivityModal
          day={day}
          activity={selected}
          onClose={() => setSelected(null)}
        />
      )}

      <FloatingDayToolbar currentIndex={dayIndex} onSelect={goTo} watch={navRef} />
    </main>
  )
}
