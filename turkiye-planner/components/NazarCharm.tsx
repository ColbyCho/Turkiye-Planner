'use client'

import { useRef, useState } from 'react'

/**
 * A nazar boncuğu (evil-eye amulet) hanging from the top of the page,
 * dutifully protecting visitors from evil spirits. It sways gently on its
 * own, and swings harder + blinks when hovered or clicked.
 */
export default function NazarCharm() {
  const [blinking, setBlinking] = useState(false)
  const [swinging, setSwinging] = useState(false)
  const timers = useRef<ReturnType<typeof setTimeout>[]>([])

  const ward = () => {
    if (blinking) return
    setBlinking(true)
    setSwinging(true)
    timers.current.forEach(clearTimeout)
    timers.current = [
      setTimeout(() => setBlinking(false), 400),
      setTimeout(() => setSwinging(false), 1300),
    ]
  }

  return (
    <button
      type="button"
      onClick={ward}
      onMouseEnter={ward}
      title="Nazar boncuğu — on duty against evil spirits"
      aria-label="Nazar amulet. Click to ward off the evil eye."
      className={`nazar absolute right-1 top-0 z-30 cursor-pointer sm:right-2 lg:right-8 ${
        swinging ? 'nazar-boing' : ''
      }`}
    >
      <svg
        viewBox="0 0 120 210"
        className="h-24 w-auto drop-shadow-md sm:h-32 lg:h-44"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* cord */}
        <line x1="60" y1="0" x2="60" y2="72" stroke="#96340B" strokeWidth="3" />
        <circle cx="60" cy="76" r="6" fill="none" stroke="#A66E15" strokeWidth="4" />
        {/* glass body */}
        <circle cx="60" cy="132" r="50" fill="#1E4B8E" stroke="#16386B" strokeWidth="3" />
        {/* the eye — this part blinks */}
        <g className={`nazar-eye ${blinking ? 'nazar-blink' : ''}`}>
          <circle cx="60" cy="132" r="34" fill="#F4EFE8" />
          <circle cx="60" cy="132" r="21" fill="#79C1CB" />
          <circle cx="60" cy="132" r="11" fill="#16386B" />
          <circle cx="55" cy="126" r="4" fill="#F4EFE8" />
        </g>
        {/* glass highlight */}
        <ellipse cx="44" cy="104" rx="16" ry="8" fill="#fff" opacity="0.35" transform="rotate(-32 44 104)" />
      </svg>
    </button>
  )
}
