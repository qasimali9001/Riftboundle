import type { SavedGamePayload } from './types'

const PREFIX = 'riftboundle:game:'

export function saveKeyForDate(dateYmd: string): string {
  return `${PREFIX}${dateYmd}`
}

export function loadSavedGame(dateYmd: string): SavedGamePayload | null {
  if (typeof localStorage === 'undefined') return null
  try {
    const raw = localStorage.getItem(saveKeyForDate(dateYmd))
    if (!raw) return null
    return JSON.parse(raw) as SavedGamePayload
  } catch {
    return null
  }
}

export function persistGame(payload: SavedGamePayload): void {
  if (typeof localStorage === 'undefined') return
  try {
    localStorage.setItem(saveKeyForDate(payload.date), JSON.stringify(payload))
  } catch {
    /* ignore */
  }
}

export function clearSavedGame(dateYmd: string): void {
  if (typeof localStorage === 'undefined') return
  localStorage.removeItem(saveKeyForDate(dateYmd))
}
