import { useEffect, useMemo } from 'react'
import { RiftboundRevealedCard } from '../../components/riftbound/RiftboundCardFace'
import type { GameState } from '../../lib/types'

type WinModalProps = {
  open: boolean
  onClose: () => void
  game: GameState
}

export function WinModal({ open, onClose, game }: WinModalProps) {
  const card = game.targetCard

  const { letterChecks, panelHints } = useMemo(() => {
    const letters =
      game.revealed.letters.length + game.letterMisses.length
    return {
      letterChecks: letters,
      panelHints: Math.max(0, game.hintsUsed - letters),
    }
  }, [game.hintsUsed, game.revealed.letters, game.letterMisses])

  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [open])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="win-modal-title"
      onClick={onClose}
      onKeyDown={(e) => {
        if (e.key === 'Escape') onClose()
      }}
    >
      <div
        className="max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-2xl border border-emerald-800/35 bg-gradient-to-b from-[#141a22] to-[#0c0f14] p-5 shadow-2xl shadow-black/60 sm:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <h2
          id="win-modal-title"
          className="font-display text-center text-2xl font-bold text-emerald-300 sm:text-3xl"
        >
          You got it!
        </h2>
        <p className="mt-1 text-center text-sm text-slate-400">
          Today&apos;s Card Revealed
        </p>

        <div className="mt-8 flex flex-col items-stretch gap-8 lg:flex-row lg:items-start lg:gap-10">
          <div className="mx-auto w-full max-w-[400px] shrink-0 lg:mx-0">
            <RiftboundRevealedCard
              card={card}
              revealed={{ keywords: true }}
            />
          </div>

          <div className="flex min-w-0 flex-1 flex-col justify-center gap-4 rounded-xl border border-white/10 bg-black/25 p-5 sm:p-6">
            <StatBlock label="Final Score" value={String(game.score)} large />
            <StatBlock
              label="Guesses"
              value={String(game.guesses.length)}
            />
            <StatBlock
              label="Hints Used"
              value={String(panelHints)}
              sub="Domain, Might, Card Type, Keywords"
            />
            <StatBlock
              label="Letters Used"
              value={String(letterChecks)}
              sub="Letter keyboard taps (correct or incorrect)"
            />
            <button
              type="button"
              className="mt-2 w-full rounded-xl border border-emerald-700/50 bg-emerald-950/40 py-3 text-sm font-semibold text-emerald-100 transition hover:bg-emerald-900/50"
              onClick={onClose}
            >
              Continue
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function StatBlock({
  label,
  value,
  sub,
  large,
}: {
  label: string
  value: string
  sub?: string
  large?: boolean
}) {
  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
        {label}
      </p>
      <p
        className={`font-display font-bold tabular-nums text-white ${large ? 'text-3xl sm:text-4xl' : 'text-xl'}`}
      >
        {value}
      </p>
      {sub ? <p className="mt-1 text-xs leading-snug text-slate-500">{sub}</p> : null}
    </div>
  )
}
