'use client'

import { useEffect, useState } from 'react'
import { useProfile } from '@/lib/useProfile'
import Avatar from './Avatar'
import ProfileEditor from './ProfileEditor'

/**
 * First-run overlay: pick which of the seven you are, then confirm your
 * name + photo. Selection is remembered, so it only appears once per device
 * (until you switch users). Shows nothing once you're signed in or have
 * chosen to browse without signing in.
 */
export default function ProfileGate() {
  const { profiles, me, loading, error, selectMe, dismissGate, gateDismissed, reload } =
    useProfile()
  const [pickedId, setPickedId] = useState<string | null>(null)

  // Reset the picked step whenever the gate re-opens.
  useEffect(() => {
    if (me || gateDismissed) setPickedId(null)
  }, [me, gateDismissed])

  if (me || gateDismissed) return null

  const picked = profiles.find((p) => p.id === pickedId) ?? null

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-ink/70 p-4 backdrop-blur-sm">
      <div className="relative max-h-[88vh] w-full max-w-md overflow-y-auto rounded-md border border-rule bg-paper-card p-6 shadow-page sm:p-8">
        {picked ? (
          <>
            <p className="text-center font-hand text-2xl text-spice">Set up your profile</p>
            <p className="mb-5 mt-1 text-center text-sm text-ink/60">
              This is how the crew will see you.
            </p>
            <ProfileEditor
              profile={picked}
              saveLabel="Save & enter"
              backLabel="Not me"
              onBack={() => setPickedId(null)}
              onSaved={() => selectMe(picked.id)}
            />
          </>
        ) : (
          <>
            <p className="text-center font-hand text-3xl text-spice">Who are you?</p>
            <p className="mb-6 mt-1 text-center text-sm text-ink/60">
              Pick yourself to react to the plans. We’ll remember you on this device.
            </p>

            {loading && <p className="py-8 text-center text-sm text-ink/50">Loading the crew…</p>}

            {error && !loading && (
              <div className="py-6 text-center">
                <p className="text-sm text-ink/70">
                  Couldn’t reach the server. Check your connection.
                </p>
                <div className="mt-4 flex justify-center gap-2">
                  <button
                    type="button"
                    onClick={reload}
                    className="rounded bg-spice px-4 py-2 text-sm font-semibold text-paper hover:bg-spice-dark"
                  >
                    Retry
                  </button>
                  <button
                    type="button"
                    onClick={dismissGate}
                    className="rounded border border-rule px-4 py-2 text-sm text-ink/70 hover:bg-ink/5"
                  >
                    Browse without signing in
                  </button>
                </div>
              </div>
            )}

            {!loading && !error && (
              <>
                <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
                  {profiles.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setPickedId(p.id)}
                      className="flex flex-col items-center gap-2 rounded-md border border-rule bg-paper px-2 py-4 transition hover:border-spice hover:bg-spice/5"
                    >
                      <Avatar profile={p} size={52} />
                      <span className="text-sm font-medium text-ink/80">{p.name}</span>
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={dismissGate}
                  className="mt-5 w-full text-center text-xs text-ink/40 underline underline-offset-2 hover:text-ink/60"
                >
                  just browsing — skip for now
                </button>
              </>
            )}
          </>
        )}
      </div>
    </div>
  )
}
