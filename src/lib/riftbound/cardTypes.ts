import type { Card } from '../types'

/** Might (top-right) applies to Units only — Gear/Spell have no Might stat in UI. */
export function isUnitCard(card: Card): boolean {
  return card.cardType.toLowerCase() === 'unit'
}

/** Gear has no domain *cost* row under energy (region still appears on type line). */
export function isGearCard(card: Card): boolean {
  return card.cardType.toLowerCase() === 'gear'
}
