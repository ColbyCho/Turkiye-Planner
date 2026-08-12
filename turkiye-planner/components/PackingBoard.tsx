'use client'

import Link from 'next/link'
import { ProfileProvider, useProfile } from '@/lib/useProfile'
import { usePacking } from '@/lib/usePacking'
import { PACKING, PACKING_TOTAL } from '@/data/packing'
import TurkishFlag from './TurkishFlag'
import ProfileBadge from './ProfileBadge'
import ProfileGate from './ProfileGate'
import Countdown from './Countdown'

function Check() {
  return (
    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M20 6L9 17l-5-5" />
    </svg>
  )
}

/** One checklist row. Interactive when signed in; a static preview otherwise. */
function Item({
  label,
  note,
  checked,
  canEdit,
  onToggle,
}: {
  label: string
  note?: string
  checked: boolean
  canEdit: boolean
  onToggle: () => void
}) {
  return (
    <li>
      <button
        type="button"
        disabled={!canEdit}
        onClick={onToggle}
        aria-pressed={checked}
        className={`flex w-full items-start gap-3 rounded-lg px-2.5 py-2 text-left transition ${
          canEdit ? 'hover:bg-saffron-light/30' : 'cursor-default'
        }`}
      >
        <span
          className={`mt-[3px] flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 transition ${
            checked ? 'border-spice bg-spice text-paper' : 'border-rule bg-paper text-transparent'
          }`}
        >
          <Check />
        </span>
        <span className="min-w-0">
          <span
            className={`text-[15px] font-medium transition ${
              checked ? 'text-ink/40 line-through' : 'text-ink/90'
            }`}
          >
            {label}
          </span>
          {note && <span className="mt-0.5 block text-xs leading-snug text-ink/50">{note}</span>}
        </span>
      </button>
    </li>
  )
}

function PackingInner() {
  const { me, openGate } = useProfile()
  const { checked, toggle } = usePacking(me?.id ?? null)
  const canEdit = !!me
  const done = checked.size
  const pct = PACKING_TOTAL ? Math.round((done / PACKING_TOTAL) * 100) : 0

  return (
    <main className="relative mx-auto max-w-3xl px-3 py-8 pb-24 sm:px-6 sm:py-10">
      <ProfileGate />

      {/* Back to the planner */}
      <div className="mb-6">
        <Link
          href="/"
          className="inline-flex items-center gap-1 rounded-full border border-rule bg-paper-card py-1.5 pl-2 pr-3.5 text-sm font-medium text-ink/70 shadow-block transition hover:border-spice hover:text-spice"
        >
          <span aria-hidden className="text-lg leading-none">‹</span> Planner
        </Link>
      </div>

      {/* Masthead — styled like the main page */}
      <header className="mb-7 text-center">
        <p className="mb-1 font-hand text-2xl text-spice">The Official</p>
        <h1 className="flex items-center justify-center gap-3 font-display text-4xl font-semibold tracking-wide sm:gap-4 sm:text-5xl md:text-6xl">
          <TurkishFlag className="h-7 w-auto drop-shadow-sm sm:h-9 md:h-10" />
          <span>Packing List</span>
        </h1>
        <p className="mt-2 text-sm uppercase tracking-[0.25em] text-ink/60">
          Istanbul ✶ Bodrum · August 21 – 31, 2026
        </p>
        <Countdown variant="inline" />
        <div>
          <ProfileBadge />
        </div>
      </header>

      {/* Progress (signed in) or a sign-in nudge (guests) */}
      {canEdit ? (
        <div className="mx-auto mb-8 max-w-md">
          <div className="mb-1.5 flex items-baseline justify-between text-xs font-semibold uppercase tracking-[0.15em] text-ink/50">
            <span>Packed</span>
            <span className="tabular-nums text-spice">
              {done} / {PACKING_TOTAL}
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-rule/40">
            <div
              className="h-full rounded-full bg-spice transition-all duration-300"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      ) : (
        <div className="mx-auto mb-8 max-w-md rounded-lg border border-dashed border-rule bg-paper-card px-4 py-3 text-center text-sm text-ink/60">
          You’re viewing the list.{' '}
          <button
            type="button"
            onClick={openGate}
            className="font-semibold text-spice underline underline-offset-2 hover:text-spice-dark"
          >
            Sign in
          </button>{' '}
          to check items off and save your own copy.
        </div>
      )}

      {/* The checklist */}
      <div className="overflow-hidden rounded-md border border-rule bg-paper-card shadow-page">
        {PACKING.map((section, i) => (
          <section
            key={section.id}
            className={i > 0 ? 'border-t-2 border-rule' : undefined}
          >
            <div className="px-4 pt-5 sm:px-6">
              <h2 className="flex items-center gap-2 font-display text-2xl font-semibold">
                <span aria-hidden>{section.emoji}</span>
                {section.title}
              </h2>
              {section.blurb && (
                <p className="mt-1 text-sm text-ink/60">{section.blurb}</p>
              )}
            </div>
            <ul className="px-2 pb-4 pt-2 sm:px-4">
              {section.items.map((item) => (
                <Item
                  key={item.id}
                  label={item.label}
                  note={item.note}
                  checked={checked.has(item.id)}
                  canEdit={canEdit}
                  onToggle={() => toggle(item.id)}
                />
              ))}
            </ul>
          </section>
        ))}
      </div>

      <p className="mt-6 text-center text-xs text-ink/40">
        Your checkmarks are saved to your profile — everyone packs their own list.
      </p>
    </main>
  )
}

export default function PackingBoard() {
  // Its own ProfileProvider (reads the same saved profile from localStorage),
  // so this route works standalone without the planner's providers.
  return (
    <ProfileProvider>
      <PackingInner />
    </ProfileProvider>
  )
}
