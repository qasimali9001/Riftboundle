import type { Card, SavedGamePayload } from '../types'

/**
 * Deterministic 32-bit FNV-1a hash for UTF-8-ish strings (code units).
 * Same input yields same index across clients for a given sorted card list.
 */
export function fnv1a32(input: string): number {
  let hash = 0x811c9dc5
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i)
    hash = Math.imul(hash, 0x01000193)
  }
  return hash >>> 0
}

/** UTC calendar day `YYYY-MM-DD` → index into list of length `len` */
export function dailyIndex(dateUtcYmd: string, len: number): number {
  if (len <= 0) return 0
  return fnv1a32(dateUtcYmd) % len
}

/**
 * Deterministic daily pick: start at {@link dailyIndex}, then advance until a card
 * not in `usedIds`. If every card is used, returns the original seeded card.
 */
export function pickDailyCard(
  cards: Card[],
  dateUtcYmd: string,
  usedIds: Set<string>,
): Card {
  const len = cards.length
  if (len === 0) {
    throw new Error('pickDailyCard: empty card list')
  }
  const start = dailyIndex(dateUtcYmd, len)
  for (let offset = 0; offset < len; offset += 1) {
    const card = cards[(start + offset) % len]
    if (!usedIds.has(card.id)) return card
  }
  return cards[start]
}

/** Resolve persisted or legacy daily target from save + current card list. */
export function resolveTargetCardFromSave(
  cards: Card[],
  dateYmd: string,
  saved: SavedGamePayload,
): Card {
  const len = cards.length
  if (saved.targetCardId) {
    const found = cards.find((c) => c.id === saved.targetCardId)
    if (found) return found
  }
  return cards[dailyIndex(dateYmd, len)]
}
