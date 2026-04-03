import { useEffect, useMemo, useState } from 'react'
import {
  RiftboundCardFace,
  RiftboundRevealedCard,
} from '../../components/riftbound/RiftboundCardFace'
import { HINT_COST } from '../../lib/config'
import { useGameStore } from '../../store/useGameStore'
import { WinModal } from './WinModal'

export function GamePanel() {
  const game = useGameStore((s) => s.game)
  const playDate = useGameStore((s) => s.playDate)
  const shakeWrong = useGameStore((s) => s.shakeWrong)
  const dismissShake = useGameStore((s) => s.dismissShake)

  const [winDismissed, setWinDismissed] = useState(false)

  const revealedLetters = useMemo(() => game?.revealed.letters ?? [], [game?.revealed.letters])

  useEffect(() => {
    setWinDismissed(false)
  }, [playDate, game?.targetCard?.id])

  if (!game) return null

  const { targetCard: card, revealed, isComplete, won } = game

  return (
    <div className="space-y-6">
      <WinModal
        open={isComplete && won && !winDismissed}
        onClose={() => setWinDismissed(true)}
        game={game}
      />

      {/* Spellify-style status strip */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-rift-border/80 bg-rift-panel/90 px-4 py-3 shadow-sm">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Score</p>
          <p className="font-display text-2xl font-bold tabular-nums text-white">{game.score}</p>
        </div>
        <div className="text-right">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Hints</p>
          <p className="text-sm text-slate-300">
            {game.hintsUsed} used · {HINT_COST} pts each
          </p>
        </div>
      </div>

      <section
        className={`rounded-2xl border border-rift-border/60 bg-gradient-to-b from-[#12151c] to-rift-bg/95 p-4 shadow-xl sm:p-6 ${shakeWrong ? 'animate-shake' : ''}`}
        onAnimationEnd={() => {
          if (shakeWrong) dismissShake()
        }}
      >
        {isComplete && won ? (
          <RiftboundRevealedCard card={card} revealed={{ keywords: true }} />
        ) : (
          <RiftboundCardFace
            card={card}
            revealed={{
              keywords: revealed.keywords,
              might: revealed.might,
              classification: revealed.classification,
            }}
            revealedLetters={revealedLetters}
            domainsHidden={!revealed.color}
          />
        )}

        {game.guesses.length > 0 && (
          <div className="mt-6 overflow-hidden rounded-lg border border-rift-border/80 bg-black/20">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-rift-border/80 bg-black/30 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-3 py-2">#</th>
                  <th className="px-3 py-2">Guess</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-rift-border/40 text-slate-300">
                {game.guesses.map((g, i) => (
                  <tr key={`${g}-${i}`}>
                    <td className="px-3 py-2 tabular-nums text-slate-500">{i + 1}</td>
                    <td className="px-3 py-2">{g}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}
