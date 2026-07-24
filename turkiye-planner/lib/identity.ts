import { isCrewName, type CrewName } from './crew'

// ─────────────────────────────────────────────────────────────────────────────
// "Which one are you?" — the visitor's own name, remembered on their device.
//
// There's no backend (the site is a static export), so this never leaves the
// browser. It's stored twice, in the two longest-lived places a static page
// has, and each read re-writes both — so a value survives as long as either
// store does, and the cookie's expiry keeps rolling forward on every visit.
//
// Caveat worth knowing: Safari caps JS-set cookies at 7 days and evicts
// localStorage after 7 days without a visit. Nothing on a static site can beat
// that — adding the planner to the home screen does.
// ─────────────────────────────────────────────────────────────────────────────

const STORAGE_KEY = 'turkiye-planner.whoami'
const COOKIE_KEY = 'tp_whoami'
/** 400 days — the longest expiry Chrome honors; anything larger is capped. */
const COOKIE_MAX_AGE_SECONDS = 400 * 24 * 60 * 60

function readCookie(): string | null {
  const match = document.cookie.match(
    new RegExp(`(?:^|;\\s*)${COOKIE_KEY}=([^;]*)`)
  )
  return match ? decodeURIComponent(match[1]) : null
}

function writeCookie(name: CrewName | null): void {
  const value = name ? encodeURIComponent(name) : ''
  const maxAge = name ? COOKIE_MAX_AGE_SECONDS : 0
  document.cookie = `${COOKIE_KEY}=${value}; max-age=${maxAge}; path=/; SameSite=Lax`
}

/** Persist (or clear, with null) the visitor's identity in both stores. */
export function writeIdentity(name: CrewName | null): void {
  if (typeof window === 'undefined') return
  try {
    if (name) window.localStorage.setItem(STORAGE_KEY, name)
    else window.localStorage.removeItem(STORAGE_KEY)
  } catch {
    // Private browsing / storage disabled — the cookie is the fallback.
  }
  try {
    writeCookie(name)
  } catch {
    // Cookies disabled — localStorage is the fallback.
  }
}

/**
 * The remembered name, or null. Must be called from an effect, not during
 * render: the page is prerendered at build time and would hydrate-mismatch.
 */
export function readIdentity(): CrewName | null {
  if (typeof window === 'undefined') return null

  let stored: string | null = null
  try {
    stored = window.localStorage.getItem(STORAGE_KEY)
  } catch {
    // ignore — fall through to the cookie
  }

  let cookie: string | null = null
  try {
    cookie = readCookie()
  } catch {
    // ignore — fall through to null
  }

  const name = isCrewName(stored) ? stored : isCrewName(cookie) ? cookie : null
  // Re-write on every read: repairs whichever store was cleared and pushes the
  // cookie's expiry back out to the full window.
  if (name) writeIdentity(name)
  return name
}
