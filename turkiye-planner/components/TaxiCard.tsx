'use client'

import { useState } from 'react'
import { STAYS, stayOn, type Stay } from '@/data/stays'
import { Stamp, type StampLink } from './HelpfulStuff'
import StampModal from './StampModal'

const STAMP: StampLink = {
  id: 'taxi',
  label: 'Taksi, lütfen — show the driver where home is tonight',
  topText: 'TAKSİ, LÜTFEN',
  bottomText: '✶ SHOW THE DRIVER ✶',
  icon: 'taxi',
  url: null,
}

/** One stay as a driver-readable card: big type, address, map button. */
function StayCard({ stay, tonight }: { stay: Stay; tonight: boolean }) {
  return (
    <div
      className={`rounded-md border p-4 text-left ${
        tonight ? 'border-spice bg-spice/5' : 'border-rule bg-paper'
      }`}
    >
      {tonight && (
        <p className="mb-1 text-[11px] font-bold uppercase tracking-[0.2em] text-spice">
          Tonight
        </p>
      )}
      <p className="text-xl font-semibold leading-snug text-ink">{stay.name}</p>
      <p className="mt-0.5 text-sm text-ink/70">{stay.area}</p>
      {stay.address && (
        <p className="mt-2 text-lg leading-snug text-ink/90">{stay.address}</p>
      )}
      {stay.note && <p className="mt-2 text-xs text-ink/50">{stay.note}</p>}
      <div className="mt-3 flex flex-wrap gap-2">
        <a
          href={stay.mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded bg-spice px-3 py-1.5 text-sm font-medium text-paper transition hover:bg-spice-dark"
        >
          📍 Open the map
        </a>
        {stay.phone && (
          <a
            href={`tel:${stay.phone.replace(/\s/g, '')}`}
            className="rounded border border-spice px-3 py-1.5 text-sm font-medium text-spice transition hover:bg-spice/10"
          >
            {stay.phone}
          </a>
        )}
      </div>
    </div>
  )
}

/**
 * The "get me home" stamp: opens a card with tonight's address in big type —
 * hand your phone to the driver. Tonight's stay leads; the rest follow.
 */
export default function TaxiCard({ rotate }: { rotate: string }) {
  const [open, setOpen] = useState(false)

  const todayISO = new Date().toLocaleDateString('en-CA')
  const tonight = stayOn(todayISO)
  const ordered = tonight
    ? [tonight, ...STAYS.filter((s) => s.id !== tonight.id)]
    : STAYS

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={STAMP.label}
        className={`group inline-block ${rotate} text-spice/75 transition-transform duration-300 hover:rotate-0 hover:scale-105 hover:text-spice focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-spice`}
      >
        <Stamp link={STAMP} />
      </button>

      {open && (
        <StampModal label="Taksi, lütfen" onClose={() => setOpen(false)}>
          <p className="text-center font-hand text-3xl text-spice">Taksi, lütfen!</p>
          <p className="mt-1 text-center text-sm text-ink/60">
            Hand the driver your phone — this is where we sleep.
          </p>
          <p className="mt-3 rounded-md bg-saffron-light/50 px-3 py-2 text-center text-base font-medium text-ink/90">
            “Beni buraya götürün, lütfen.”
            <span className="mt-0.5 block text-xs font-normal text-ink/55">
              Take me here, please · beh-nee boo-rah-yah gur-tur-run luut-fen
            </span>
          </p>

          <div className="mt-4 space-y-3">
            {ordered.map((s) => (
              <StayCard key={s.id} stay={s} tonight={s.id === tonight?.id} />
            ))}
          </div>

          <p className="mt-4 text-center text-xs text-ink/45">
            Emergencies anywhere in Türkiye: dial <span className="font-semibold">112</span>
          </p>
        </StampModal>
      )}
    </>
  )
}
