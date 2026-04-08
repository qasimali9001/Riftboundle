import { useEffect, useMemo, useState } from 'react'
import { isUnitCard } from '../../lib/riftbound/cardTypes'
import { HINT_COST } from '../../lib/config'
import { useGameStore } from '../../store/useGameStore'
import { LetterKeyboard } from './LetterKeyboard'

function nextUtcMidnightCountdown(): string {
  const now = new Date()
  const next = new Date(now)
  next.setUTCHours(24, 0, 0, 0)
  const ms = Math.max(0, next.getTime() - now.getTime())
  const h = Math.floor(ms / 3600000)
  const m = Math.floor((ms % 3600000) / 60000)
  const s = Math.floor((ms % 60000) / 1000)
  return `${h}h ${m}m ${s}s`
}

export function HintBar() {
  const game = useGameStore((s) => s.game)
  const hintColor = useGameStore((s) => s.hintColor)
  const hintMight = useGameStore((s) => s.hintMight)
  const hintClassification = useGameStore((s) => s.hintClassification)
  const [tick, setTick] = useState(0)

  useEffect(() => {
    const id = window.setInterval(() => setTick((t) => t + 1), 1000)
    return () => window.clearInterval(id)
  }, [])

  const countdown = useMemo(() => nextUtcMidnightCountdown(), [tick])

  if (!game || game.isComplete) {
    return (
      <p className="mt-6 text-center text-xs text-slate-600">
        Next puzzle (UTC): {countdown}
      </p>
    )
  }

  return (
    <div className="mt-8 space-y-6 rounded-xl border border-rift-border bg-rift-panel/60 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
        <span>
          Hints &amp; letter taps: up to −{HINT_COST} pts (score stops at 0; free at 0)
        </span>
        <span>Next daily reset (UTC): {countdown}</span>
      </div>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={game.revealed.color}
          className="rounded-lg border border-rift-border bg-rift-bg px-4 py-2 text-sm font-medium text-slate-200 hover:border-slate-500 disabled:cursor-not-allowed disabled:opacity-40"
          onClick={() => hintColor()}
        >
          Reveal Domain
        </button>
        <button
          type="button"
          disabled={game.revealed.might || !isUnitCard(game.targetCard)}
          title={
            !isUnitCard(game.targetCard)
              ? 'Only units have Might — not used for this card'
              : undefined
          }
          className="rounded-lg border border-rift-border bg-rift-bg px-4 py-2 text-sm font-medium text-slate-200 hover:border-slate-500 disabled:cursor-not-allowed disabled:opacity-40"
          onClick={() => hintMight()}
        >
          Reveal Might
        </button>
        <button
          type="button"
          disabled={game.revealed.classification}
          className="rounded-lg border border-rift-border bg-rift-bg px-4 py-2 text-sm font-medium text-slate-200 hover:border-slate-500 disabled:cursor-not-allowed disabled:opacity-40"
          onClick={() => hintClassification()}
        >
          Reveal Card Type
        </button>
      </div>

      <div className="border-t border-rift-border/80 pt-4">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
          Letters
        </p>
        <LetterKeyboard />
      </div>
    </div>
  )
}
