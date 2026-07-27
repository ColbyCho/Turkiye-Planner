'use client'

import { useProfile } from '@/lib/useProfile'
import Avatar from './Avatar'

/** Overlapping voter avatars — up to `max`, then a “+N” for the rest. */
export default function AvatarStack({
  ids,
  max = 4,
  size = 22,
}: {
  ids: string[]
  max?: number
  size?: number
}) {
  const { profiles } = useProfile()
  if (ids.length === 0) return null
  const shown = ids.slice(0, max)
  const extra = ids.length - shown.length

  return (
    <div className="flex items-center">
      <div className="flex -space-x-1.5">
        {shown.map((id) => {
          const p = profiles.find((x) => x.id === id)
          if (!p) return null
          return (
            <Avatar key={id} profile={p} size={size} className="ring-2 ring-paper-card" />
          )
        })}
      </div>
      {extra > 0 && (
        <span className="ml-1 text-xs font-semibold tabular-nums text-ink/50">+{extra}</span>
      )}
    </div>
  )
}
