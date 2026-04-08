import type { Card, SavedGamePayload } from './types'
import {
  CACHE_CARDS_KEY,
  CACHE_META_KEY,
  KEYWORD_INDEX_KEY,
  KEYWORD_INDEX_META_KEY,
} from './config'
import { dailyIndex } from './utils/seed'

const PREFIX = 'riftboundle:game:'
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/

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

/**
 * Dates with saved games (from localStorage), as `YYYY-MM-DD`.
 * Newest first.
 */
export function listSavedGameDates(): string[] {
  if (typeof localStorage === 'undefined') return []
  const out: string[] = []
  for (let i = 0; i < localStorage.length; i += 1) {
    const key = localStorage.key(i)
    if (!key?.startsWith(PREFIX)) continue
    const dateYmd = key.slice(PREFIX.length)
    if (!DATE_RE.test(dateYmd)) continue
    out.push(dateYmd)
  }
  out.sort((a, b) => (a < b ? 1 : a > b ? -1 : 0))
  return out
}

/** Clears saved games and API caches (for testing / reset). */
export function clearAllRiftboundleData(): void {
  if (typeof localStorage === 'undefined') return
  const keysToRemove: string[] = []
  for (let i = 0; i < localStorage.length; i += 1) {
    const key = localStorage.key(i)
    if (key?.startsWith(PREFIX)) keysToRemove.push(key)
  }
  for (const k of keysToRemove) localStorage.removeItem(k)
  localStorage.removeItem(CACHE_CARDS_KEY)
  localStorage.removeItem(CACHE_META_KEY)
  localStorage.removeItem(KEYWORD_INDEX_KEY)
  localStorage.removeItem(KEYWORD_INDEX_META_KEY)
}

/**
 * Card IDs already used as the daily target on another date (from localStorage).
 * Legacy saves without `targetCardId` infer the card via {@link dailyIndex}.
 */
export function collectUsedTargetCardIds(
  cards: Card[],
  excludeDateYmd: string,
): Set<string> {
  const len = cards.length
  const used = new Set<string>()
  if (len === 0 || typeof localStorage === 'undefined') return used

  for (let i = 0; i < localStorage.length; i += 1) {
    const key = localStorage.key(i)
    if (!key?.startsWith(PREFIX)) continue
    const dateYmd = key.slice(PREFIX.length)
    if (dateYmd === excludeDateYmd) continue
    const raw = localStorage.getItem(key)
    if (!raw) continue
    try {
      const payload = JSON.parse(raw) as SavedGamePayload
      if (payload.targetCardId) {
        used.add(payload.targetCardId)
      } else {
        used.add(cards[dailyIndex(dateYmd, len)].id)
      }
    } catch {
      /* ignore */
    }
  }
  return used
}
