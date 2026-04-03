export type Card = {
  id: string
  name: string
  /** Might (units only in UI — top-right shield) */
  manaCost: string
  /** Energy — large number in top-left circle (play cost) */
  energyCost: string
  text: string
  /** Ability keywords only (e.g. Deflect) — lime boxes; from API tags */
  keywords: string[]
  /** Domains / regions (e.g. Noxus) — rune + type line */
  color: string[]
  image?: string
  /** Spell, Unit, Gear, … */
  cardType: string
  /** Champion, … — optional */
  supertype: string | null
}

export type RevealedState = {
  /** Domain / recycle rune under energy (colours) */
  color: boolean
  keywords: boolean
  letters: string[]
  /** Top-right Might value (or N/A) */
  might: boolean
  /** Type line: supertype + card type + domains */
  classification: boolean
}

export type GameState = {
  targetCard: Card
  guesses: string[]
  score: number
  hintsUsed: number
  revealed: RevealedState
  /** Letters the player tapped that are not in name + rules (keyboard grey state) */
  letterMisses: string[]
  isComplete: boolean
  won: boolean
}

export type SavedGamePayload = {
  date: string
  /** Which card this save belongs to (required when daily pick skips “used” cards). */
  targetCardId?: string
  score: number
  guesses: string[]
  hintsUsed: number
  revealed: RevealedState
  letterMisses?: string[]
  isComplete: boolean
  won: boolean
}
