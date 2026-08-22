import type { ReactNode } from 'react'

// ─────────────────────────────────────────────────────────────────────────────
// Weather marks — single-weight stroke art in currentColor, drawn from Lucide
// (lucide.dev, ISC licensed). Same visual language as the activity motifs and
// the passport stamps, so the forecast reads as part of the page instead of a
// browser emoji pasted on top. All drawn in a 24×24 box.
// ─────────────────────────────────────────────────────────────────────────────

export type WeatherIconName =
  | 'sun'
  | 'cloud-sun'
  | 'cloud'
  | 'cloudy'
  | 'cloud-fog'
  | 'haze'
  | 'cloud-drizzle'
  | 'cloud-rain'
  | 'cloud-rain-wind'
  | 'cloud-sun-rain'
  | 'cloud-snow'
  | 'snowflake'
  | 'cloud-lightning'
  | 'cloud-hail'

const ART: Record<WeatherIconName, ReactNode> = {
  sun: (
    <>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2" />
      <path d="M12 20v2" />
      <path d="m4.93 4.93 1.41 1.41" />
      <path d="m17.66 17.66 1.41 1.41" />
      <path d="M2 12h2" />
      <path d="M20 12h2" />
      <path d="m6.34 17.66-1.41 1.41" />
      <path d="m19.07 4.93-1.41 1.41" />
    </>
  ),
  'cloud-sun': (
    <>
      <path d="M12 2v2" />
      <path d="m4.93 4.93 1.41 1.41" />
      <path d="M20 12h2" />
      <path d="m19.07 4.93-1.41 1.41" />
      <path d="M15.947 12.65a4 4 0 0 0-5.925-4.128" />
      <path d="M13 22H7a5 5 0 1 1 4.9-6H13a3 3 0 0 1 0 6Z" />
    </>
  ),
  cloud: <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z" />,
  cloudy: (
    <>
      <path d="M17.5 12a1 1 0 1 1 0 9H9.006a7 7 0 1 1 6.702-9z" />
      <path d="M21.832 9A3 3 0 0 0 19 7h-2.207a5.5 5.5 0 0 0-10.72.61" />
    </>
  ),
  'cloud-fog': (
    <>
      <path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242" />
      <path d="M16 17H7" />
      <path d="M17 21H9" />
    </>
  ),
  haze: (
    <>
      <path d="m5.2 6.2 1.4 1.4" />
      <path d="M2 13h2" />
      <path d="M20 13h2" />
      <path d="m17.4 7.6 1.4-1.4" />
      <path d="M22 17H2" />
      <path d="M22 21H2" />
      <path d="M16 13a4 4 0 0 0-8 0" />
      <path d="M12 5V2.5" />
    </>
  ),
  'cloud-drizzle': (
    <>
      <path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242" />
      <path d="M8 19v1" />
      <path d="M8 14v1" />
      <path d="M16 19v1" />
      <path d="M16 14v1" />
      <path d="M12 21v1" />
      <path d="M12 16v1" />
    </>
  ),
  'cloud-rain': (
    <>
      <path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242" />
      <path d="M16 14v6" />
      <path d="M8 14v6" />
      <path d="M12 16v6" />
    </>
  ),
  'cloud-rain-wind': (
    <>
      <path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242" />
      <path d="m9.2 22 3-7" />
      <path d="m9 13-3 7" />
      <path d="m17 13-3 7" />
    </>
  ),
  'cloud-sun-rain': (
    <>
      <path d="M12 2v2" />
      <path d="m4.93 4.93 1.41 1.41" />
      <path d="M20 12h2" />
      <path d="m19.07 4.93-1.41 1.41" />
      <path d="M15.947 12.65a4 4 0 0 0-5.925-4.128" />
      <path d="M3 20a5 5 0 1 1 8.9-4H13a3 3 0 0 1 2 5.24" />
      <path d="M11 20v2" />
      <path d="M7 19v2" />
    </>
  ),
  'cloud-snow': (
    <>
      <path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242" />
      <path d="M8 15h.01" />
      <path d="M8 19h.01" />
      <path d="M12 17h.01" />
      <path d="M12 21h.01" />
      <path d="M16 15h.01" />
      <path d="M16 19h.01" />
    </>
  ),
  snowflake: (
    <>
      <path d="m10 20-1.25-2.5L6 18" />
      <path d="M10 4 8.75 6.5 6 6" />
      <path d="m14 20 1.25-2.5L18 18" />
      <path d="m14 4 1.25 2.5L18 6" />
      <path d="m17 21-3-6h-4" />
      <path d="m17 3-3 6 1.5 3" />
      <path d="M2 12h6.5L10 9" />
      <path d="m20 10-1.5 2 1.5 2" />
      <path d="M22 12h-6.5L14 15" />
      <path d="m4 10 1.5 2L4 14" />
      <path d="m7 21 3-6-1.5-3" />
      <path d="m7 3 3 6h4" />
    </>
  ),
  'cloud-lightning': (
    <>
      <path d="M6 16.326A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 .5 8.973" />
      <path d="m13 12-3 5h4l-3 5" />
    </>
  ),
  'cloud-hail': (
    <>
      <path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242" />
      <path d="M16 14v2" />
      <path d="M8 14v2" />
      <path d="M16 20h.01" />
      <path d="M8 20h.01" />
      <path d="M12 16v2" />
      <path d="M12 22h.01" />
    </>
  ),
}

/** WMO weather code → the mark to draw and what to call it in plain English. */
export function weatherFor(code: number): { icon: WeatherIconName; label: string } {
  switch (code) {
    case 0:
      return { icon: 'sun', label: 'Clear' }
    case 1:
      return { icon: 'cloud-sun', label: 'Mainly clear' }
    case 2:
      return { icon: 'cloud', label: 'Partly cloudy' }
    case 3:
      return { icon: 'cloudy', label: 'Overcast' }
    case 45:
      return { icon: 'cloud-fog', label: 'Fog' }
    case 48:
      return { icon: 'haze', label: 'Freezing fog' }
    case 51:
      return { icon: 'cloud-drizzle', label: 'Light drizzle' }
    case 53:
      return { icon: 'cloud-drizzle', label: 'Drizzle' }
    case 55:
      return { icon: 'cloud-rain', label: 'Heavy drizzle' }
    case 56:
    case 57:
      return { icon: 'cloud-hail', label: 'Freezing drizzle' }
    case 61:
      return { icon: 'cloud-rain', label: 'Light rain' }
    case 63:
      return { icon: 'cloud-rain', label: 'Rain' }
    case 65:
      return { icon: 'cloud-rain-wind', label: 'Heavy rain' }
    case 66:
    case 67:
      return { icon: 'cloud-hail', label: 'Freezing rain' }
    case 71:
      return { icon: 'cloud-snow', label: 'Light snow' }
    case 73:
      return { icon: 'cloud-snow', label: 'Snow' }
    case 75:
      return { icon: 'snowflake', label: 'Heavy snow' }
    case 77:
      return { icon: 'snowflake', label: 'Snow grains' }
    case 80:
      return { icon: 'cloud-sun-rain', label: 'Light showers' }
    case 81:
      return { icon: 'cloud-rain', label: 'Showers' }
    case 82:
      return { icon: 'cloud-rain-wind', label: 'Heavy showers' }
    case 85:
    case 86:
      return { icon: 'cloud-snow', label: 'Snow showers' }
    case 95:
      return { icon: 'cloud-lightning', label: 'Thunderstorm' }
    case 96:
    case 99:
      return { icon: 'cloud-hail', label: 'Thunderstorm with hail' }
    default:
      return { icon: 'cloud-sun', label: 'Mixed' }
  }
}

export default function WeatherIcon({
  name,
  size = 16,
  className = '',
}: {
  name: WeatherIconName
  size?: number
  className?: string
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {ART[name]}
    </svg>
  )
}
