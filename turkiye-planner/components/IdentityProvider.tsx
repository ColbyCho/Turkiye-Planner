'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { CrewName } from '@/lib/crew'
import { readIdentity, writeIdentity } from '@/lib/identity'
import WhoAreYou from './WhoAreYou'

interface PendingAction {
  /** Why we're asking — shown in the picker so the prompt isn't a non-sequitur. */
  reason: string
  run: (me: CrewName) => void
}

interface IdentityValue {
  me: CrewName | null
  /** False until the stored name has been read; the page is prerendered. */
  ready: boolean
  setMe: (name: CrewName | null) => void
  /** Open the picker deliberately (the "not you?" affordance). */
  promptMe: () => void
  /**
   * Run `action` if we know who you are — otherwise ask first, then run it
   * with the name you picked. Every person-specific action goes through here.
   */
  requireMe: (reason: string, action: (me: CrewName) => void) => void
}

const IdentityContext = createContext<IdentityValue | null>(null)

export function useIdentity(): IdentityValue {
  const ctx = useContext(IdentityContext)
  if (!ctx) throw new Error('useIdentity must be used inside <IdentityProvider>')
  return ctx
}

export default function IdentityProvider({ children }: { children: ReactNode }) {
  const [me, setMeState] = useState<CrewName | null>(null)
  const [ready, setReady] = useState(false)
  const [asking, setAsking] = useState(false)
  const [pending, setPending] = useState<PendingAction | null>(null)

  // Read after mount, never during render: this page ships as prerendered HTML
  // and reading storage inline would hydrate-mismatch.
  useEffect(() => {
    setMeState(readIdentity())
    setReady(true)
  }, [])

  const setMe = useCallback((name: CrewName | null) => {
    setMeState(name)
    writeIdentity(name)
  }, [])

  const promptMe = useCallback(() => {
    setPending(null)
    setAsking(true)
  }, [])

  const requireMe = useCallback(
    (reason: string, action: (me: CrewName) => void) => {
      if (me) {
        action(me)
        return
      }
      setPending({ reason, run: action })
      setAsking(true)
    },
    [me]
  )

  const choose = useCallback(
    (name: CrewName) => {
      setMe(name)
      setAsking(false)
      const queued = pending
      setPending(null)
      // Carry on with whatever they were trying to do before we interrupted.
      queued?.run(name)
    },
    [pending, setMe]
  )

  const dismiss = useCallback(() => {
    setAsking(false)
    setPending(null)
  }, [])

  const value = useMemo(
    () => ({ me, ready, setMe, promptMe, requireMe }),
    [me, ready, setMe, promptMe, requireMe]
  )

  return (
    <IdentityContext.Provider value={value}>
      {children}
      {asking && (
        <WhoAreYou
          me={me}
          reason={pending?.reason ?? null}
          onChoose={choose}
          onClear={() => {
            setMe(null)
            dismiss()
          }}
          onClose={dismiss}
        />
      )}
    </IdentityContext.Provider>
  )
}
