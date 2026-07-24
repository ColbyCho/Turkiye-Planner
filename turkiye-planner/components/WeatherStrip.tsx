import { cToF, climateFor } from '@/data/weather'
import type { DayPlan } from '@/lib/types'

/** What August is usually like where this day happens. Normals, not forecast. */
export default function WeatherStrip({ day }: { day: DayPlan }) {
  const climate = climateFor(day.city)
  if (!climate) return null

  return (
    <p
      className="mt-2 text-[11px] leading-relaxed text-ink/50"
      title="Long-run August averages — a real forecast won't exist until about a week out."
    >
      <span aria-hidden>🌡️</span>{' '}
      <span className="font-medium text-ink/70">
        {climate.highC}° / {climate.lowC}°C
      </span>{' '}
      <span className="text-ink/40">
        ({cToF(climate.highC)}° / {cToF(climate.lowC)}°F)
      </span>
      {climate.seaC && <> · sea {climate.seaC}°C</>} · {climate.note}
    </p>
  )
}
