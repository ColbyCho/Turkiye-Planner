'use client'

import { useCallback, useMemo } from 'react'
import { CREW_PROFILES, type CrewName } from '@/data/crew'
import type { CrewProfile } from '@/lib/types'
import { useTable } from './useTable'
import type { ProfileRow } from './types'
import type { StoreMode } from './store'

/** Blank strings mean "not filled in", so they shouldn't mask a default. */
function clean(value: string | null | undefined): string | undefined {
  const trimmed = value?.trim()
  return trimmed ? trimmed : undefined
}

/** A saved row on top of the static defaults from data/crew.ts. */
export function mergeProfile(
  base: CrewProfile,
  row: ProfileRow | undefined
): CrewProfile {
  if (!row) return base
  return {
    ...base,
    photo: clean(row.photo_url) ?? base.photo,
    title: clean(row.title) ?? base.title,
    homeCity: clean(row.home_city) ?? base.homeCity,
    knownFor: clean(row.known_for) ?? base.knownFor,
    dietary: clean(row.dietary) ?? base.dietary,
    funFact: clean(row.fun_fact) ?? base.funFact,
    quote: clean(row.quote) ?? base.quote,
    room: clean(row.room) ?? base.room,
    seatOut: clean(row.seat_out) ?? base.seatOut,
    seatHome: clean(row.seat_home) ?? base.seatHome,
    fun: { ...base.fun, ...(row.fun ?? {}) },
  }
}

export function profileToRow(name: string, profile: CrewProfile): ProfileRow {
  return {
    name,
    photo_url: profile.photo ?? null,
    title: profile.title ?? null,
    home_city: profile.homeCity ?? null,
    known_for: profile.knownFor ?? null,
    dietary: profile.dietary ?? null,
    fun_fact: profile.funFact ?? null,
    quote: profile.quote ?? null,
    room: profile.room ?? null,
    seat_out: profile.seatOut ?? null,
    seat_home: profile.seatHome ?? null,
    fun: profile.fun ?? {},
    updated_at: new Date().toISOString(),
  }
}

export interface CrewProfilesHandle {
  /** Static defaults with anything saved layered on top. */
  profile: (name: CrewName) => CrewProfile
  save: (name: CrewName, profile: CrewProfile) => Promise<void>
  mode: StoreMode
}

export function useCrewProfiles(): CrewProfilesHandle {
  const { rows, upsert, mode } = useTable('profiles')

  const byName = useMemo(() => {
    const map = new Map<string, ProfileRow>()
    for (const row of rows) map.set(row.name, row)
    return map
  }, [rows])

  const profile = useCallback(
    (name: CrewName) => mergeProfile(CREW_PROFILES[name] ?? {}, byName.get(name)),
    [byName]
  )

  const save = useCallback(
    (name: CrewName, next: CrewProfile) => upsert(profileToRow(name, next)),
    [upsert]
  )

  return { profile, save, mode }
}
