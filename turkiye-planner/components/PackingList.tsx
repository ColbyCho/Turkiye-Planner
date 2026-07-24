'use client'

import { useEffect, useState } from 'react'
import {
  DEFAULT_PACKING,
  readPacking,
  totalItems,
  writePacking,
  type PackingState,
} from '@/lib/packing'
import { useIdentity } from './IdentityProvider'
import Disclosure from './Disclosure'

export default function PackingList() {
  const { me, requireMe } = useIdentity()
  const [state, setState] = useState<PackingState>({ checked: [], custom: [] })
  const [draft, setDraft] = useState('')

  // Reload whenever the reader changes — everyone gets their own list.
  useEffect(() => {
    setState(me ? readPacking(me) : { checked: [], custom: [] })
  }, [me])

  const update = (next: PackingState) => {
    setState(next)
    if (me) writePacking(me, next)
  }

  const toggle = (item: string) =>
    requireMe('So the list is yours and not everyone’s.', () => {
      const checked = state.checked.includes(item)
        ? state.checked.filter((i) => i !== item)
        : [...state.checked, item]
      update({ ...state, checked })
    })

  const addCustom = () => {
    const item = draft.trim()
    if (!item) return
    requireMe('So the list is yours and not everyone’s.', () => {
      setDraft('')
      update({ ...state, custom: [...state.custom, item] })
    })
  }

  const done = state.checked.length
  const total = totalItems(state.custom)

  return (
    <Disclosure
      title="Packing list"
      hint={me ? `${done}/${total} packed · just for you` : 'private to your device'}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        {DEFAULT_PACKING.map((group) => (
          <section key={group.title}>
            <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-ink/45">
              <span aria-hidden>{group.emoji}</span> {group.title}
            </p>
            <ul className="mt-1.5 space-y-1">
              {group.items.map((item) => (
                <li key={item}>
                  <label className="flex cursor-pointer items-start gap-2 text-sm text-ink/80">
                    <input
                      type="checkbox"
                      checked={state.checked.includes(item)}
                      onChange={() => toggle(item)}
                      className="mt-0.5 h-4 w-4 shrink-0 accent-[#C1440E]"
                    />
                    <span
                      className={
                        state.checked.includes(item) ? 'text-ink/35 line-through' : ''
                      }
                    >
                      {item}
                    </span>
                  </label>
                </li>
              ))}
            </ul>
          </section>
        ))}

        {state.custom.length > 0 && (
          <section>
            <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-ink/45">
              <span aria-hidden>✍️</span> Yours
            </p>
            <ul className="mt-1.5 space-y-1">
              {state.custom.map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <label className="flex flex-1 cursor-pointer items-start gap-2 text-sm text-ink/80">
                    <input
                      type="checkbox"
                      checked={state.checked.includes(item)}
                      onChange={() => toggle(item)}
                      className="mt-0.5 h-4 w-4 shrink-0 accent-[#C1440E]"
                    />
                    <span
                      className={
                        state.checked.includes(item) ? 'text-ink/35 line-through' : ''
                      }
                    >
                      {item}
                    </span>
                  </label>
                  <button
                    type="button"
                    onClick={() =>
                      update({
                        checked: state.checked.filter((i) => i !== item),
                        custom: state.custom.filter((i) => i !== item),
                      })
                    }
                    className="text-[10px] text-ink/30 transition hover:text-spice"
                    aria-label={`Remove ${item}`}
                  >
                    ✕
                  </button>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>

      <div className="mt-4 flex gap-2">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              addCustom()
            }
          }}
          placeholder="Add your own…"
          className="min-w-0 flex-1 rounded border border-rule bg-paper px-2 py-1.5 text-sm placeholder:text-ink/30 focus:border-cobalt focus:outline-none sm:max-w-xs"
        />
        <button
          type="button"
          onClick={addCustom}
          disabled={!draft.trim()}
          className="rounded border border-cobalt px-2.5 py-1 text-xs font-medium text-cobalt transition hover:bg-cobalt hover:text-paper disabled:opacity-40"
        >
          Add
        </button>
      </div>

      <p className="mt-3 text-[10px] text-ink/35">
        Stays on this device — nobody else sees what you’ve ticked.
      </p>
    </Disclosure>
  )
}
