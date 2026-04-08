import Fuse from 'fuse.js'
import { create } from 'zustand'
import { fetchAllCards } from '../lib/api/fetchCards'
import { ARCHIVE_MIN_DATE, HINT_COST, SCORE_START, WRONG_GUESS_PENALTY } from '../lib/config'
import { isUnitCard } from '../lib/riftbound/cardTypes'
import {
  clearSavedGame,
  collectUsedTargetCardIds,
  loadSavedGame,
  persistGame,
} from '../lib/storage'
import type { Card, GameState, SavedGamePayload } from '../lib/types'
import {
  guessMatchesCard,
  letterAppearsOnCard,
  normalizeGuess,
} from '../lib/utils/mask'
import {
  pickDailyCard,
  resolveTargetCardFromSave,
} from '../lib/utils/seed'

function utcTodayYmd(): string {
  return new Date().toISOString().slice(0, 10)
}

function clampPlayDate(dateYmd: string): string {
  const today = utcTodayYmd()
  if (dateYmd < ARCHIVE_MIN_DATE) return ARCHIVE_MIN_DATE
  if (dateYmd > today) return today
  return dateYmd
}

function clampScore(n: number): number {
  return Math.max(0, n)
}

/** Deduct HINT_COST; score never goes below 0. At 0, no deduction (free hints). */
function scoreAfterHint(score: number): number {
  const s = clampScore(score)
  if (s === 0) return 0
  return clampScore(s - HINT_COST)
}

function createInitialGame(target: Card): GameState {
  return {
    targetCard: target,
    guesses: [],
    score: SCORE_START,
    hintsUsed: 0,
    revealed: {
      color: false,
      keywords: false,
      letters: [],
      might: false,
      classification: false,
    },
    letterMisses: [],
    isComplete: false,
    won: false,
  }
}

function payloadFromGame(game: GameState, dateYmd: string): SavedGamePayload {
  return {
    date: dateYmd,
    targetCardId: game.targetCard.id,
    score: game.score,
    guesses: game.guesses,
    hintsUsed: game.hintsUsed,
    revealed: {
      ...game.revealed,
      letters: [...game.revealed.letters],
    },
    letterMisses: [...game.letterMisses],
    isComplete: game.isComplete,
    won: game.won,
  }
}

type LoadState = 'idle' | 'loading' | 'ready' | 'error'

type GameStore = {
  cards: Card[] | null
  loadState: LoadState
  loadError: string | null
  playDate: string
  game: GameState | null
  shakeWrong: boolean
  fuse: Fuse<Card> | null

  loadCards: () => Promise<void>
  setPlayDate: (dateYmd: string) => void
  replayFresh: () => void
  submitGuess: (raw: string) => void
  hintColor: () => void
  hintKeywords: () => void
  hintMight: () => void
  hintClassification: () => void
  tryLetterKey: (letter: string) => void
  dismissShake: () => void

  searchCardNames: (q: string) => Card[]
}

function buildGameFromSave(target: Card, saved: SavedGamePayload): GameState {
  const letters = saved.revealed.letters.map((l) => l.toLowerCase())
  const r = saved.revealed
  return {
    targetCard: target,
    guesses: [...saved.guesses],
    score: saved.score,
    hintsUsed: saved.hintsUsed,
    revealed: {
      color: r.color,
      keywords: r.keywords,
      letters,
      might: r.might ?? false,
      classification: r.classification ?? false,
    },
    letterMisses: [...(saved.letterMisses ?? [])],
    isComplete: saved.isComplete,
    won: saved.won,
  }
}

function initGameForDate(
  cards: Card[],
  dateYmd: string,
): GameState {
  const saved = loadSavedGame(dateYmd)
  if (saved) {
    const target = resolveTargetCardFromSave(cards, dateYmd, saved)
    return buildGameFromSave(target, saved)
  }
  const used = collectUsedTargetCardIds(cards, dateYmd)
  const target = pickDailyCard(cards, dateYmd, used)
  return createInitialGame(target)
}

export const useGameStore = create<GameStore>((set, get) => ({
  cards: null,
  loadState: 'idle',
  loadError: null,
  playDate: utcTodayYmd(),
  game: null,
  shakeWrong: false,
  fuse: null,

  loadCards: async () => {
    set({ loadState: 'loading', loadError: null })
    try {
      const cards = await fetchAllCards()
      if (cards.length === 0) {
        set({
          loadState: 'error',
          loadError: 'No playable cards returned from the API.',
        })
        return
      }
      const fuse = new Fuse(cards, {
        keys: ['name'],
        threshold: 0.35,
        ignoreLocation: true,
      })
      const { playDate } = get()
      const game = initGameForDate(cards, playDate)
      set({ cards, fuse, loadState: 'ready', game })
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Failed to load cards'
      set({ loadState: 'error', loadError: msg })
    }
  },

  setPlayDate: (dateYmd) => {
    const { cards } = get()
    const d = clampPlayDate(dateYmd)
    set({ playDate: d })
    if (cards?.length) {
      const game = initGameForDate(cards, d)
      set({ game })
    }
  },

  replayFresh: () => {
    const { cards, playDate } = get()
    if (!cards?.length) return
    clearSavedGame(playDate)
    const used = collectUsedTargetCardIds(cards, playDate)
    const target = pickDailyCard(cards, playDate, used)
    const game = createInitialGame(target)
    set({ game })
    persistGame(payloadFromGame(game, playDate))
  },

  submitGuess: (raw) => {
    const { game, playDate, cards } = get()
    if (!game || game.isComplete || !cards?.length) return
    const g = normalizeGuess(raw)
    if (!g) return

    const norm = (s: string) => normalizeGuess(s).toLowerCase()
    if (game.guesses.some((x) => norm(x) === norm(g))) {
      return
    }

    if (guessMatchesCard(g, game.targetCard.name)) {
      const next: GameState = {
        ...game,
        guesses: [...game.guesses, g],
        isComplete: true,
        won: true,
      }
      set({ game: next })
      persistGame(payloadFromGame(next, playDate))
      return
    }

    const next: GameState = {
      ...game,
      guesses: [...game.guesses, g],
      score: clampScore(game.score - WRONG_GUESS_PENALTY),
    }
    set({ game: next, shakeWrong: true })
    persistGame(payloadFromGame(next, playDate))
  },

  hintColor: () => {
    const { game, playDate } = get()
    if (!game || game.isComplete || game.revealed.color) return
    const next: GameState = {
      ...game,
      score: scoreAfterHint(game.score),
      hintsUsed: game.hintsUsed + 1,
      revealed: { ...game.revealed, color: true },
    }
    set({ game: next })
    persistGame(payloadFromGame(next, playDate))
  },

  hintKeywords: () => {
    const { game, playDate } = get()
    if (!game || game.isComplete || game.revealed.keywords) return
    const next: GameState = {
      ...game,
      score: scoreAfterHint(game.score),
      hintsUsed: game.hintsUsed + 1,
      revealed: { ...game.revealed, keywords: true },
    }
    set({ game: next })
    persistGame(payloadFromGame(next, playDate))
  },

  hintMight: () => {
    const { game, playDate } = get()
    if (!game || game.isComplete || game.revealed.might) return
    if (!isUnitCard(game.targetCard)) return
    const next: GameState = {
      ...game,
      score: scoreAfterHint(game.score),
      hintsUsed: game.hintsUsed + 1,
      revealed: { ...game.revealed, might: true },
    }
    set({ game: next })
    persistGame(payloadFromGame(next, playDate))
  },

  hintClassification: () => {
    const { game, playDate } = get()
    if (!game || game.isComplete || game.revealed.classification) return
    const next: GameState = {
      ...game,
      score: scoreAfterHint(game.score),
      hintsUsed: game.hintsUsed + 1,
      revealed: { ...game.revealed, classification: true },
    }
    set({ game: next })
    persistGame(payloadFromGame(next, playDate))
  },

  tryLetterKey: (letter) => {
    const { game, playDate } = get()
    if (!game || game.isComplete) return
    const L = letter.trim().toLowerCase()
    if (!/^[a-z]$/.test(L)) return
    if (game.revealed.letters.includes(L)) return

    if (!letterAppearsOnCard(L, game.targetCard)) {
      if (game.letterMisses.includes(L)) return
      const next: GameState = {
        ...game,
        score: scoreAfterHint(game.score),
        hintsUsed: game.hintsUsed + 1,
        letterMisses: [...game.letterMisses, L],
      }
      set({ game: next })
      persistGame(payloadFromGame(next, playDate))
      return
    }

    const next: GameState = {
      ...game,
      score: scoreAfterHint(game.score),
      hintsUsed: game.hintsUsed + 1,
      revealed: {
        ...game.revealed,
        letters: [...game.revealed.letters, L],
      },
    }
    set({ game: next })
    persistGame(payloadFromGame(next, playDate))
  },

  dismissShake: () => set({ shakeWrong: false }),

  searchCardNames: (q) => {
    const { fuse, cards } = get()
    const query = q.trim()
    if (!query || !cards?.length) return cards ?? []
    if (!fuse) return cards
    return fuse.search(query).slice(0, 12).map((r) => r.item)
  },
}))
