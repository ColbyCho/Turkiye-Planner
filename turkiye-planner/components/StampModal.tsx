'use client'

import { useEffect, type ReactNode } from 'react'

/**
 * Shared paper-card modal opened from a passport stamp (taxi card,
 * phrasebook). Same shell as the activity modal: dimmed backdrop, tape strip,
 * pinned close button, scrollable body.
 */
export default function StampModal({
  label,
  accent = '#C1440E',
  onClose,
  children,
}: {
  /** Accessible name for the dialog. */
  label: string
  /** Tape-strip color, defaults to spice. */
  accent?: string
  onClose: () => void
  children: ReactNode
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-ink/60 p-4 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={label}
    >
      <div
        className="relative flex max-h-[85vh] w-full max-w-md flex-col rounded-md border border-rule bg-paper-card shadow-page"
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="absolute -top-2 left-1/2 h-5 w-28 -translate-x-1/2 -rotate-1 shadow-sm"
          style={{ backgroundColor: `${accent}55` }}
          aria-hidden
        />
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-paper-card/80 text-lg text-ink/50 backdrop-blur-sm transition hover:bg-ink/10 hover:text-ink"
          aria-label="Close"
        >
          ✕
        </button>
        <div className="flex-1 overflow-y-auto overscroll-contain p-6 sm:p-7">{children}</div>
      </div>
    </div>
  )
}
