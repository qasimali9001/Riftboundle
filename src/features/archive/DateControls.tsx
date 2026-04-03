import { ARCHIVE_MIN_DATE } from '../../lib/config'
import { loadSavedGame } from '../../lib/storage'
import { useGameStore } from '../../store/useGameStore'

function utcTodayYmd(): string {
  return new Date().toISOString().slice(0, 10)
}

export function DateControls() {
  const playDate = useGameStore((s) => s.playDate)
  const setPlayDate = useGameStore((s) => s.setPlayDate)
  const replayFresh = useGameStore((s) => s.replayFresh)
  const game = useGameStore((s) => s.game)

  const today = utcTodayYmd()
  const saved = loadSavedGame(playDate)
  const showReplay =
    saved?.isComplete === true || (game?.isComplete === true && game.won)

  return (
    <div className="mb-6 flex flex-col gap-3 rounded-xl border border-rift-border bg-rift-panel/80 p-4 sm:flex-row sm:items-center sm:justify-between">
      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium text-slate-300">Play date (UTC)</span>
        <input
          type="date"
          className="rounded-md border border-rift-border bg-rift-bg px-3 py-2 text-slate-100 outline-none focus:border-rift-accent focus:ring-1 focus:ring-rift-accent"
          min={ARCHIVE_MIN_DATE}
          max={today}
          value={playDate}
          onChange={(e) => {
            const v = e.target.value
            if (v) setPlayDate(v)
          }}
        />
      </label>
      <div className="flex flex-wrap items-center gap-2">
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
              if (confirm('Start a fresh attempt for this date? Your saved result will be cleared.')) {
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
