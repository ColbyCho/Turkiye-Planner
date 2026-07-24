'use client'

import { useEffect } from 'react'

/** How many modals are currently open — the page stays locked until all close. */
let openModals = 0

/**
 * Escape-to-close plus a ref-counted body scroll lock.
 *
 * Modals stack here (an activity opens a profile, which can open the name
 * picker), so the last one to close is the one that unlocks the page — and
 * only the topmost should answer Escape. Pass `escape: false` for a modal
 * that currently has something on top of it.
 */
export function useModalChrome(
  onClose: () => void,
  { escape = true }: { escape?: boolean } = {}
): void {
  useEffect(() => {
    if (!escape) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [escape, onClose])

  useEffect(() => {
    openModals += 1
    document.body.style.overflow = 'hidden'
    return () => {
      openModals -= 1
      if (openModals === 0) document.body.style.overflow = ''
    }
  }, [])
}
