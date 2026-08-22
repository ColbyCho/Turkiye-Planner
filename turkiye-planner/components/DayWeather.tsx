'use client'

import { useEffect, useState } from 'react'
import type { DayPlan } from '@/lib/types'
import { tabParts } from '@/lib/time'
import WeatherIcon, { weatherFor } from './WeatherIcon'

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
 * The viewed day's forecast, as one line for the day header: the date it
 * belongs to, then a drawn weather mark and the high/low — one entry per city
 * on transfer days. Renders nothing while loading, out of forecast range, or
 * offline, so the planner never waits on the weather.
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

  const { weekday, day: dayNum } = tabParts(day.date)

  return (
    <div className="text-right leading-tight">
      <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-ink/40">
        {weekday} {dayNum}
      </p>
      <p className="flex flex-wrap items-center justify-end gap-x-2.5 text-xs font-medium text-ink/60">
        {entries.map(({ city, f }) => {
          const { icon, label } = weatherFor(f.code)
          return (
            <span
              key={city}
              className="inline-flex items-center gap-1"
              title={`${city}: ${label}, high ${f.maxF}°F / low ${f.minF}°F`}
            >
              {entries.length > 1 && (
                <span className="text-[10px] uppercase tracking-[0.1em] text-ink/40">
                  {city.slice(0, 3)}
                </span>
              )}
              <WeatherIcon name={icon} size={15} className="shrink-0 text-spice/75" />
              <span className="tabular-nums">
                {f.maxF}°<span className="text-ink/35">/{f.minF}°</span>
              </span>
            </span>
          )
        })}
      </p>
    </div>
  )
}
