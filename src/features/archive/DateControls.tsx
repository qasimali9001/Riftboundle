import { ARCHIVE_MIN_DATE } from '../../lib/config'
import { loadSavedGame } from '../../lib/storage'
import { useGameStore } from '../../store/useGameStore'

function utcTodayYmd(): string {
  return new Date().toISOString().slice(0, 10)
}

function addUtcDays(ymd: string, deltaDays: number): string {
  const d = new Date(`${ymd}T00:00:00.000Z`)
  d.setUTCDate(d.getUTCDate() + deltaDays)
  return d.toISOString().slice(0, 10)
}

function diffUtcDays(aYmd: string, bYmd: string): number {
  const a = new Date(`${aYmd}T00:00:00.000Z`).getTime()
  const b = new Date(`${bYmd}T00:00:00.000Z`).getTime()
  return Math.floor((b - a) / 86400000)
}

export function DateControls({ onOpenPreviousGames }: { onOpenPreviousGames: () => void }) {
  const playDate = useGameStore((s) => s.playDate)
  const setPlayDate = useGameStore((s) => s.setPlayDate)
  const replayFresh = useGameStore((s) => s.replayFresh)
  const game = useGameStore((s) => s.game)

  const today = utcTodayYmd()
  const minDate = ARCHIVE_MIN_DATE
  const saved = loadSavedGame(playDate)
  const showReplay =
    saved?.isComplete === true || (game?.isComplete === true && game.won)

  const prevDay = addUtcDays(playDate, -1)
  const nextDay = addUtcDays(playDate, 1)
  const canPrev = playDate > minDate
  const canNext = playDate < today

  const gameNumber = diffUtcDays(minDate, playDate) + 1

  return (
    <div className="no-word-split mb-6 rounded-xl border border-rift-border bg-rift-panel/80 p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            Daily puzzle
          </p>
          <p className="mt-0.5 text-sm text-slate-300">
            <span className="font-semibold text-white">Game #{gameNumber}</span>{' '}
            <span className="text-slate-500">({playDate} UTC)</span>
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            disabled={!canPrev}
            className="rounded-md border border-rift-border bg-rift-bg px-3 py-2 text-sm text-slate-200 hover:border-slate-500 disabled:cursor-not-allowed disabled:opacity-40"
            onClick={() => setPlayDate(prevDay)}
          >
            ← Prev
          </button>
          <button
            type="button"
            disabled={playDate === today}
            className="rounded-md border border-rift-border bg-rift-bg px-3 py-2 text-sm text-slate-200 hover:border-slate-500 disabled:cursor-not-allowed disabled:opacity-40"
            onClick={() => setPlayDate(today)}
          >
            Today
          </button>
          <button
            type="button"
            disabled={!canNext}
            className="rounded-md border border-rift-border bg-rift-bg px-3 py-2 text-sm text-slate-200 hover:border-slate-500 disabled:cursor-not-allowed disabled:opacity-40"
            onClick={() => setPlayDate(nextDay)}
          >
            Next →
          </button>
          <button
            type="button"
            className="rounded-md border border-rift-accent/40 bg-rift-bg px-3 py-2 text-sm font-medium text-rift-accent hover:border-rift-accent"
            onClick={onOpenPreviousGames}
          >
            Previous games
          </button>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-rift-border/60 pt-3">
        {playDate !== today && (
          <button
            type="button"
            className="rounded-md border border-rift-border bg-rift-bg px-3 py-2 text-sm text-slate-200 hover:border-slate-500"
            onClick={() => setPlayDate(today)}
          >
            Jump to today
          </button>
        )}
        {showReplay && (
          <button
            type="button"
            className="rounded-md bg-amber-600/90 px-3 py-2 text-sm font-medium text-white hover:bg-amber-500"
            onClick={() => {
              if (
                confirm(
                  'Start a fresh attempt for this date? Your saved result will be cleared.',
                )
              ) {
                replayFresh()
              }
            }}
          >
            Replay (fresh)
          </button>
        )}
      </div>
    </div>
  )
}
