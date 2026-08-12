'use client'

import { useEffect, useState } from 'react'
import type { DayPlan } from '@/lib/types'

// Open-Meteo (free, no key). One request per city covers its whole 16-day
// forecast horizon; each day page then just picks its date out of the cache.
const CITY_COORDS: Record<string, { lat: number; lon: number }> = {
  Boston: { lat: 42.36, lon: -71.06 },
  Istanbul: { lat: 41.01, lon: 28.98 },
  Bodrum: { lat: 37.03, lon: 27.43 },
}

interface DailyForecast {
  code: number
  maxF: number
  minF: number
}

type CityForecasts = Record<string, DailyForecast> // date -> forecast

const TTL_MS = 3 * 3600_000
const memory = new Map<string, CityForecasts>()

/** WMO weather code → a glanceable emoji. */
function weatherEmoji(code: number): string {
  if (code === 0) return '☀️'
  if (code <= 2) return '🌤️'
  if (code === 3) return '☁️'
  if (code === 45 || code === 48) return '🌫️'
  if (code >= 95) return '⛈️'
  if ((code >= 71 && code <= 77) || code === 85 || code === 86) return '❄️'
  if (code >= 51) return '🌧️'
  return '🌤️'
}

async function fetchCity(city: string): Promise<CityForecasts | null> {
  const hit = memory.get(city)
  if (hit) return hit

  const storageKey = `tp-weather-${city}`
  try {
    const raw = sessionStorage.getItem(storageKey)
    if (raw) {
      const { at, data } = JSON.parse(raw) as { at: number; data: CityForecasts }
      if (Date.now() - at < TTL_MS) {
        memory.set(city, data)
        return data
      }
    }
  } catch {
    /* ignore */
  }

  const { lat, lon } = CITY_COORDS[city]
  const url =
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
    `&daily=weather_code,temperature_2m_max,temperature_2m_min` +
    `&temperature_unit=fahrenheit&timezone=auto&forecast_days=16`
  try {
    const res = await fetch(url)
    if (!res.ok) return null
    const json = (await res.json()) as {
      daily?: {
        time: string[]
        weather_code: number[]
        temperature_2m_max: number[]
        temperature_2m_min: number[]
      }
    }
    if (!json.daily) return null
    const data: CityForecasts = {}
    json.daily.time.forEach((date, i) => {
      data[date] = {
        code: json.daily!.weather_code[i],
        maxF: Math.round(json.daily!.temperature_2m_max[i]),
        minF: Math.round(json.daily!.temperature_2m_min[i]),
      }
    })
    memory.set(city, data)
    try {
      sessionStorage.setItem(storageKey, JSON.stringify({ at: Date.now(), data }))
    } catch {
      /* ignore */
    }
    return data
  } catch {
    return null
  }
}

/** The known cities this day touches — both ends of a transfer day. */
function citiesOf(day: DayPlan): string[] {
  return Array.from(
    new Set(
      day.city
        .split('→')
        .map((c) => c.trim())
        .filter((c) => c in CITY_COORDS)
    )
  )
}

/**
 * Compact forecast line for the day header: "☀️ 91°/75°", one entry per city
 * on transfer days. Renders nothing while loading, out of forecast range, or
 * offline — the planner never waits on the weather.
 */
export default function DayWeather({ day }: { day: DayPlan }) {
  const [entries, setEntries] = useState<{ city: string; f: DailyForecast }[]>([])

  useEffect(() => {
    let alive = true
    setEntries([])
    Promise.all(
      citiesOf(day).map(async (city) => {
        const data = await fetchCity(city)
        const f = data?.[day.date]
        return f ? { city, f } : null
      })
    ).then((results) => {
      if (alive) setEntries(results.filter((r): r is { city: string; f: DailyForecast } => !!r))
    })
    return () => {
      alive = false
    }
  }, [day])

  if (entries.length === 0) return null

  return (
    <p className="flex flex-wrap items-center justify-end gap-x-3 gap-y-0.5 text-xs font-medium text-ink/60">
      {entries.map(({ city, f }) => (
        <span key={city} title={`${city}: high ${f.maxF}°F / low ${f.minF}°F`}>
          {entries.length > 1 && <span className="text-ink/45">{city} </span>}
          <span aria-hidden>{weatherEmoji(f.code)}</span> {f.maxF}°/{f.minF}°
        </span>
      ))}
    </p>
  )
}
