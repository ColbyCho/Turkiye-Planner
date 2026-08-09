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
import { AVATARS_BUCKET, supabase, type Profile } from './supabase'

const STORAGE_KEY = 'tp-profile-id'

interface ProfileContextValue {
  /** All crew profiles (empty until loaded). */
  profiles: Profile[]
  /** The profile this browser is acting as, or null if not chosen yet. */
  me: Profile | null
  /** false while the initial profiles fetch is in flight. */
  loading: boolean
  /** true if the profiles fetch failed (e.g. Supabase unreachable). */
  error: boolean
  /** Remember a chosen profile for next time. */
  selectMe: (id: string) => void
  /** Forget the current selection (sign out / switch user). */
  clearMe: () => void
  /** Persist name/avatar edits for the given profile. */
  saveProfile: (id: string, patch: { name?: string; avatar_url?: string | null }) => Promise<void>
  /** Upload an image to the avatars bucket, returning its public URL. */
  uploadAvatar: (id: string, file: File) => Promise<string>
  reload: () => void
  /** true if the user chose to browse without signing in this session. */
  gateDismissed: boolean
  /** let the user into the site without a profile (read-only for reactions). */
  dismissGate: () => void
  /** re-open the sign-in gate (e.g. when they try to react while signed out). */
  openGate: () => void
}

const ProfileContext = createContext<ProfileContextValue | null>(null)

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [meId, setMeId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [gateDismissed, setGateDismissed] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setError(false)
    const { data, error: err } = await supabase
      .from('profiles')
      .select('id, name, avatar_url')
      .order('name')
    if (err || !data) {
      setError(true)
    } else {
      setProfiles(data as Profile[])
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) setMeId(stored)
    } catch {
      /* ignore */
    }
    load()
  }, [load])

  const selectMe = useCallback((id: string) => {
    setMeId(id)
    try {
      localStorage.setItem(STORAGE_KEY, id)
    } catch {
      /* ignore */
    }
  }, [])

  const clearMe = useCallback(() => {
    setMeId(null)
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch {
      /* ignore */
    }
  }, [])

  const saveProfile = useCallback(
    async (id: string, patch: { name?: string; avatar_url?: string | null }) => {
      // optimistic local update
      setProfiles((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch } : p)))
      const { error: err } = await supabase.from('profiles').update(patch).eq('id', id)
      if (err) throw err
    },
    []
  )

  const uploadAvatar = useCallback(async (id: string, file: File) => {
    const ext = (file.name.split('.').pop() || 'jpg').toLowerCase()
    const path = `${id}-${Date.now()}.${ext}`
    const { error: err } = await supabase.storage
      .from(AVATARS_BUCKET)
      .upload(path, file, { upsert: true, contentType: file.type || 'image/jpeg' })
    if (err) throw err
    const { data } = supabase.storage.from(AVATARS_BUCKET).getPublicUrl(path)
    return data.publicUrl
  }, [])

  const me = useMemo(
    () => profiles.find((p) => p.id === meId) ?? null,
    [profiles, meId]
  )

  const dismissGate = useCallback(() => setGateDismissed(true), [])
  const openGate = useCallback(() => setGateDismissed(false), [])

  const value = useMemo<ProfileContextValue>(
    () => ({
      profiles,
      me,
      loading,
      error,
      selectMe,
      clearMe,
      saveProfile,
      uploadAvatar,
      reload: load,
      gateDismissed,
      dismissGate,
      openGate,
    }),
    [
      profiles,
      me,
      loading,
      error,
      selectMe,
      clearMe,
      saveProfile,
      uploadAvatar,
      load,
      gateDismissed,
      dismissGate,
      openGate,
    ]
  )

  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>
}

export function useProfile(): ProfileContextValue {
  const ctx = useContext(ProfileContext)
  if (!ctx) throw new Error('useProfile must be used within ProfileProvider')
  return ctx
}
