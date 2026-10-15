'use client'

import { useCallback, useMemo, useSyncExternalStore } from 'react'

import { PROFILE_STORAGE_KEY, type Profile, parseStoredProfile } from '@/lib/profile'

/**
 * Perfil guardado SOLO en este navegador (localStorage).
 * Si el almacenamiento no está disponible (modo privado, bloqueo), funciona en memoria.
 */

const CHANGE_EVENT = 'wil:profile-change'
const SERVER = '\u0000server'
let memoryFallback = ''

function read(): string {
  try {
    return window.localStorage.getItem(PROFILE_STORAGE_KEY) ?? ''
  } catch {
    return memoryFallback
  }
}

function write(value: string | null) {
  try {
    if (value === null) window.localStorage.removeItem(PROFILE_STORAGE_KEY)
    else window.localStorage.setItem(PROFILE_STORAGE_KEY, value)
  } catch {
    memoryFallback = value ?? ''
  }
  window.dispatchEvent(new Event(CHANGE_EVENT))
}

function subscribe(onChange: () => void) {
  window.addEventListener('storage', onChange)
  window.addEventListener(CHANGE_EVENT, onChange)
  return () => {
    window.removeEventListener('storage', onChange)
    window.removeEventListener(CHANGE_EVENT, onChange)
  }
}

export function useStoredProfile() {
  const raw = useSyncExternalStore(subscribe, read, () => SERVER)
  const profile = useMemo<Profile>(() => (raw === SERVER ? {} : (parseStoredProfile(raw || null) ?? {})), [raw])
  const save = useCallback((next: Profile) => write(JSON.stringify(next)), [])
  const clear = useCallback(() => write(null), [])
  return { profile, save, clear, loaded: raw !== SERVER }
}
