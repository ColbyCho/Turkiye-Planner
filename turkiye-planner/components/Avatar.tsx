import type { Profile } from '@/lib/supabase'

// Palette drawn from the site's İznik/spice colors.
const AVATAR_COLORS = [
  '#1E4B8E', // cobalt
  '#C1440E', // spice
  '#178A99', // turquoise
  '#A66E15', // saffron dark
  '#2C2A4A', // night
  '#8F7C5F', // kraft dark
  '#96340B', // spice dark
  '#0F6773', // turquoise dark
  '#565285', // night light
]

export function avatarColor(key: string): string {
  const hash = key.split('').reduce((h, ch) => h + ch.charCodeAt(0), 0)
  return AVATAR_COLORS[hash % AVATAR_COLORS.length]
}

/** Round avatar: uploaded photo if present, otherwise a colored initial. */
export default function Avatar({
  profile,
  size = 32,
  className = '',
}: {
  profile: Pick<Profile, 'id' | 'name' | 'avatar_url'>
  size?: number
  className?: string
}) {
  const dim = { width: size, height: size }
  if (profile.avatar_url) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={profile.avatar_url}
        alt={profile.name}
        style={dim}
        className={`shrink-0 rounded-full object-cover ${className}`}
      />
    )
  }
  return (
    <span
      style={{ ...dim, backgroundColor: avatarColor(profile.id || profile.name) }}
      className={`flex shrink-0 items-center justify-center rounded-full font-semibold text-paper ${className}`}
      aria-hidden
    >
      <span style={{ fontSize: size * 0.45 }}>{profile.name.charAt(0).toUpperCase()}</span>
    </span>
  )
}
