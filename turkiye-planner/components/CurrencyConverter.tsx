'use client'

import { useEffect, useRef, useState } from 'react'

// 1 USD ≈ this many lira — an offline estimate, replaced by the live rate on
// load. It only shows if every rate source is unreachable (or the visitor is
// offline) and there's no cached rate yet.
const FALLBACK_RATE = 42
const CACHE_KEY = 'tl-usd-rate-v1'

interface Rate {
  value: number // lira per 1 USD
  updated: string | null
  live: boolean
}

/** Try a couple of free, no-key, CORS-friendly FX sources; first hit wins. */
async function fetchRate(): Promise<{ value: number; updated: string } | null> {
  const sources: Array<() => Promise<{ value: number; updated: string } | null>> = [
    async () => {
      const r = await fetch('https://open.er-api.com/v6/latest/USD')
      const j = await r.json()
      const v = j?.rates?.TRY
      return v ? { value: v, updated: j?.time_last_update_utc ?? new Date().toUTCString() } : null
    },
    async () => {
      const r = await fetch(
        'https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/usd.json'
      )
      const j = await r.json()
      const v = j?.usd?.try
      return v ? { value: v, updated: j?.date ?? new Date().toUTCString() } : null
    },
  ]
  for (const get of sources) {
    try {
      const res = await get()
      if (res && Number.isFinite(res.value) && res.value > 0) return res
    } catch {
      /* try the next source */
    }
  }
  return null
}

/** Round to 2 decimals as a plain, re-parseable string (no thousands commas). */
function round2(n: number): string {
  return String(Math.round(n * 100) / 100)
}

function updatedLabel(iso: string | null): string {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

export default function CurrencyConverter() {
  const [rate, setRate] = useState<Rate>({ value: FALLBACK_RATE, updated: null, live: false })
  const [usd, setUsd] = useState('1')
  const [lira, setLira] = useState(round2(FALLBACK_RATE))
  const [loading, setLoading] = useState(false)

  // Keep the current USD amount readable inside async callbacks without
  // re-subscribing effects.
  const usdRef = useRef(usd)
  usdRef.current = usd

  // Apply a rate, keeping the USD amount as the anchor and recomputing lira.
  const applyRate = (value: number, updated: string | null, live: boolean) => {
    setRate({ value, updated, live })
    const n = parseFloat(usdRef.current)
    setLira(Number.isFinite(n) ? round2(n * value) : '')
  }

  const refresh = () => {
    setLoading(true)
    fetchRate()
      .then((res) => {
        if (!res) return
        applyRate(res.value, res.updated, true)
        try {
          localStorage.setItem(CACHE_KEY, JSON.stringify(res))
        } catch {
          /* ignore storage errors (private mode, etc.) */
        }
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    // Show the last known rate instantly, then refresh in the background.
    try {
      const raw = localStorage.getItem(CACHE_KEY)
      if (raw) {
        const c = JSON.parse(raw)
        if (c?.value) applyRate(c.value, c.updated ?? null, false)
      }
    } catch {
      /* ignore */
    }
    refresh()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const onUsd = (v: string) => {
    setUsd(v)
    const n = parseFloat(v)
    setLira(Number.isFinite(n) ? round2(n * rate.value) : '')
  }
  const onLira = (v: string) => {
    setLira(v)
    const n = parseFloat(v)
    setUsd(Number.isFinite(n) ? round2(n / rate.value) : '')
  }

  const field =
    'w-full rounded border border-rule bg-paper px-2.5 py-2 pl-7 text-right font-mono text-lg text-ink tabular-nums focus:border-spice focus:outline-none focus:ring-1 focus:ring-spice'

  return (
    <div className="mx-auto mt-6 max-w-sm rounded-md border border-rule bg-paper-card px-5 py-4 text-center shadow-page">
      <p className="font-hand text-xl text-spice">Lira ⇄ Dollar</p>

      <div className="mt-3 flex items-center gap-2">
        <label className="relative flex-1">
          <span className="sr-only">US dollars</span>
          <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 font-mono text-ink/45">
            $
          </span>
          <input
            type="text"
            inputMode="decimal"
            value={usd}
            onChange={(e) => onUsd(e.target.value)}
            aria-label="US dollars"
            className={field}
          />
          <span className="mt-0.5 block text-[10px] font-bold uppercase tracking-[0.2em] text-ink/45">
            USD
          </span>
        </label>

        <span aria-hidden className="pb-4 text-lg text-spice">
          ⇄
        </span>

        <label className="relative flex-1">
          <span className="sr-only">Turkish lira</span>
          <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 font-mono text-ink/45">
            ₺
          </span>
          <input
            type="text"
            inputMode="decimal"
            value={lira}
            onChange={(e) => onLira(e.target.value)}
            aria-label="Turkish lira"
            className={field}
          />
          <span className="mt-0.5 block text-[10px] font-bold uppercase tracking-[0.2em] text-ink/45">
            TRY
          </span>
        </label>
      </div>

      <p className="mt-3 text-[11px] text-ink/50">
        1 USD ≈ ₺{round2(rate.value)}
        {rate.live ? (
          <>
            {' '}
            · live rate{rate.updated && ` · updated ${updatedLabel(rate.updated)}`}
          </>
        ) : (
          <> · offline estimate</>
        )}
        <button
          type="button"
          onClick={refresh}
          disabled={loading}
          aria-label="Refresh exchange rate"
          className="ml-1.5 align-middle text-spice underline decoration-dotted underline-offset-2 hover:text-spice-dark disabled:opacity-40"
        >
          {loading ? 'updating…' : 'refresh'}
        </button>
      </p>
    </div>
  )
}
