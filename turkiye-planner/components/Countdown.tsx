'use client'

import { useEffect, useState } from 'react'

// Midnight in Boston on departure day — the countdown hits zero as Aug 21 begins.
const TARGET_MS = new Date('2026-08-21T00:00:00-04:00').getTime()

interface Parts {
  days: number
  hours: number
  minutes: number
  seconds: number
}

function partsUntil(now: number): Parts | null {
  const left = TARGET_MS - now
  if (left <= 0) return null
  const s = Math.floor(left / 1000)
  return {
    days: Math.floor(s / 86400),
    hours: Math.floor((s % 86400) / 3600),
    minutes: Math.floor((s % 3600) / 60),
    seconds: s % 60,
  }
}

export default function Countdown() {
  // null until mounted so the static export and first client render agree
  const [now, setNow] = useState<number | null>(null)

  useEffect(() => {
    setNow(Date.now())
    const t = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(t)
  }, [])

  const parts = now === null ? undefined : partsUntil(now)

  return (
    <section aria-label="Countdown to Türkiye" className="mt-10 text-center">
      <p className="font-hand text-2xl text-spice">Countdown to Türkiye</p>
      {parts === null ? (
        <p className="mt-1 font-display text-xl font-semibold text-ink/80">
          Şerefe — it&rsquo;s trip time! 🇹🇷
        </p>
      ) : (
        <div className="mt-1 flex items-baseline justify-center gap-3 text-ink/80">
          {(
            [
              ['days', parts?.days],
              ['hrs', parts?.hours],
              ['min', parts?.minutes],
              ['sec', parts?.seconds],
            ] as const
          ).map(([label, n]) => (
            <div key={label} className="min-w-[2.5rem]">
              <span className="font-display text-2xl font-semibold tabular-nums">
                {n === undefined ? '––' : String(n).padStart(2, '0')}
              </span>
              <span className="block text-[9px] font-medium uppercase tracking-[0.25em] text-ink/45">
                {label}
              </span>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
