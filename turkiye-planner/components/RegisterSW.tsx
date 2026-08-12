'use client'

import { useEffect } from 'react'

/** Registers the offline service worker — production only, so dev stays uncached. */
export default function RegisterSW() {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') return
    if (!('serviceWorker' in navigator)) return
    navigator.serviceWorker.register('/sw.js').catch(() => {
      /* offline support is a bonus, never an error */
    })
  }, [])
  return null
}
