import { HINT_COST } from '../../lib/config'
import type { GameState } from '../../lib/types'
import { useGameStore } from '../../store/useGameStore'

const ROWS = ['QWERTYUIOP', 'ASDFGHJKL', 'ZXCVBNM'] as const

function keyState(
  L: string,
  game: GameState,
): 'hit' | 'miss' | 'available' {
  if (game.revealed.letters.includes(L)) return 'hit'
  if (game.letterMisses.includes(L)) return 'miss'
  return 'available'
}

export function LetterKeyboard() {
  const game = useGameStore((s) => s.game)
  const tryLetterKey = useGameStore((s) => s.tryLetterKey)

  if (!game || game.isComplete) return null

  return (
    <div className="space-y-2">
      <p className="text-xs text-slate-500">
        Each tap: up to −{HINT_COST} pts (min score 0; free at 0) —{' '}
        <span className="text-emerald-400/90">green</span> if the letter is on
        the card, <span className="text-zinc-500">grey</span> if not.
      </p>
      <div className="flex flex-col items-stretch gap-1.5 sm:items-center">
        {ROWS.map((row, ri) => (
          <div
            key={row}
            className="flex flex-wrap justify-center gap-1 sm:gap-1.5"
            style={
              ri === 1
                ? { paddingLeft: '0.5rem' }
                : ri === 2
                  ? { paddingLeft: '1rem' }
                  : undefined
            }
          >
            {row.split('').map((ch) => {
              const L = ch.toLowerCase()
              const state = keyState(L, game)

              const isHit = state === 'hit'
              const isMiss = state === 'miss'
              const disabled = isHit || isMiss

              let cls =
                'min-h-[38px] min-w-[30px] rounded-md border text-sm font-bold uppercase transition-colors duration-150 sm:min-h-[40px] sm:min-w-[32px]'
              if (isHit) {
                cls +=
                  ' border-emerald-600/80 bg-emerald-700/85 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]'
              } else if (isMiss) {
                cls +=
                  ' cursor-default border-zinc-600 bg-zinc-700/90 text-zinc-400'
              } else {
                cls +=
                  ' border-zinc-600 bg-zinc-800/90 text-zinc-200 hover:bg-zinc-700'
              }

              return (
                <button
                  key={L}
                  type="button"
                  disabled={disabled}
                  className={cls}
                  aria-label={`Letter ${ch}`}
                  onClick={() => tryLetterKey(L)}
                >
                  {ch}
                </button>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}
