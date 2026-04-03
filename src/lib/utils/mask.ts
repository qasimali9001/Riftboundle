import type { Card } from '../types'

const LETTER = /[a-z]/i

/** Letter appears anywhere in card name or rules (for keyboard / hints). */
export function letterAppearsOnCard(letter: string, card: Card): boolean {
  const pool = `${card.name} ${card.text}`.toLowerCase()
  return pool.includes(letter.toLowerCase())
}

export function maskLetters(s: string): string {
  return s
    .split('')
    .map((ch) => (LETTER.test(ch) ? '_' : ch))
    .join('')
}

export function applyLetterReveals(text: string, revealedLower: Set<string>): string {
  return text
    .split('')
    .map((ch) => {
      if (!LETTER.test(ch)) return ch
      const low = ch.toLowerCase()
      return revealedLower.has(low) ? ch : '_'
    })
    .join('')
}

export function normalizeGuess(s: string): string {
  return s.trim().replace(/\s+/g, ' ')
}

export function guessMatchesCard(guess: string, cardName: string): boolean {
  return normalizeGuess(guess).toLowerCase() === normalizeGuess(cardName).toLowerCase()
}
