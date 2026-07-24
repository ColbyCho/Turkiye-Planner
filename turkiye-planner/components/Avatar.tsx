'use client'

import { avatarColor, isCrewName } from '@/lib/crew'
import { useCrewProfiles } from '@/lib/db/profiles'
import { asset } from '@/lib/asset'

interface AvatarProps {
  name: string
  /** Rendered size in px. */
  size?: number
  className?: string
}

/**
 * A crew member's face: their photo if they've added one, otherwise their
 * initial on their fixed avatar color.
 */
export default function Avatar({ name, size = 16, className = '' }: AvatarProps) {
  const { profile } = useCrewProfiles()
  const photo = isCrewName(name) ? profile(name).photo : undefined

  if (photo) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={asset(photo)}
        alt=""
        className={`shrink-0 rounded-full object-cover ${className}`}
        style={{ width: size, height: size }}
      />
    )
  }

  return (
    <span
      className={`flex shrink-0 items-center justify-center rounded-full font-bold text-paper ${className}`}
      style={{
        width: size,
        height: size,
        backgroundColor: avatarColor(name),
        fontSize: Math.max(9, Math.round(size * 0.5)),
      }}
      aria-hidden
    >
      {name[0]}
    </span>
  )
}
