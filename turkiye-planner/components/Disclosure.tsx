'use client'

import type { ReactNode } from 'react'

interface DisclosureProps {
  title: string
  /** Short count/summary shown next to the title, e.g. '3 ideas'. */
  hint?: string
  children: ReactNode
  defaultOpen?: boolean
}

/**
 * A collapsible section styled like a tab on a paper divider. Native <details>
 * so it works before hydration and keyboard users get it for free.
 */
export default function Disclosure({
  title,
  hint,
  children,
  defaultOpen = false,
}: DisclosureProps) {
  return (
    <details open={defaultOpen} className="group border-t border-dashed border-rule">
      <summary className="flex cursor-pointer list-none items-center gap-2 px-5 py-3 sm:px-8 [&::-webkit-details-marker]:hidden">
        <span className="font-hand text-2xl text-spice">{title}</span>
        {hint && <span className="text-[11px] text-ink/45">{hint}</span>}
        <span
          className="ml-auto text-xs text-ink/40 transition-transform group-open:rotate-90"
          aria-hidden
        >
          ▶
        </span>
      </summary>
      <div className="px-5 pb-6 sm:px-8">{children}</div>
    </details>
  )
}
