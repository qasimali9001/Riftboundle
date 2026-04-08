import { useMemo, useState } from 'react'
import { ARCHIVE_MIN_DATE } from '../../lib/config'
import { clearAllRiftboundleData, listSavedGameDates, loadSavedGame } from '../../lib/storage'
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

export function PreviousGamesPage({ onBack }: { onBack: () => void }) {
  const playDate = useGameStore((s) => s.playDate)
  const setPlayDate = useGameStore((s) => s.setPlayDate)

  const today = utcTodayYmd()
  const minDate = ARCHIVE_MIN_DATE

  const [page, setPage] = useState(1)
  const pageSize = 80

  const playedMap = useMemo(() => {
    const dates = listSavedGameDates()
    const m = new Map<string, { won: boolean; complete: boolean }>()
    for (const d of dates) {
      const p = loadSavedGame(d)
      if (!p) continue
      m.set(d, { won: p.won === true, complete: p.isComplete === true })
    }
    return m
  }, [])

  const gameNumber = diffUtcDays(minDate, playDate) + 1
  const maxGameNumber = diffUtcDays(minDate, today) + 1

  const visibleCount = Math.min(maxGameNumber, page * pageSize)

  const gameRows = useMemo(() => {
    const out: Array<{ n: number; ymd: string }> = []
    for (let n = maxGameNumber; n >= 1 && out.length < visibleCount; n -= 1) {
      const ymd = addUtcDays(minDate, n - 1)
      if (ymd > today) continue
      out.push({ n, ymd })
    }
    return out
  }, [maxGameNumber, minDate, today, visibleCount])

  return (
    <div className="no-word-split space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            Previous games
          </p>
          <p className="mt-0.5 text-sm text-slate-300">
            Selected: <span className="font-semibold text-white">Game #{gameNumber}</span>{' '}
            <span className="text-slate-500">({playDate})</span>
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            className="rounded-md border border-rift-border bg-rift-bg px-3 py-2 text-sm text-slate-200 hover:border-slate-500"
            onClick={onBack}
          >
            ← Back
          </button>
          <button
            type="button"
            className="rounded-md border border-rose-900/40 bg-rose-950/20 px-3 py-2 text-sm text-rose-200 hover:border-rose-500/40"
            title="Clears all saved scores and caches (testing)"
            onClick={() => {
              if (
                !window.confirm(
                  'Clear ALL saved games and cached data? This is for testing and cannot be undone.',
                )
              ) {
                return
              }
              clearAllRiftboundleData()
              window.location.reload()
            }}
          >
            Clear test data
          </button>
          <label className="flex items-center gap-2 text-sm text-slate-300">
            <span className="text-xs text-slate-500">Go to date</span>
            <input
              type="date"
              className="rounded-md border border-rift-border bg-rift-bg px-3 py-2 text-slate-100 outline-none focus:border-rift-accent focus:ring-1 focus:ring-rift-accent"
              min={minDate}
              max={today}
              value={playDate}
              onChange={(e) => {
                const v = e.target.value
                if (!v) return
                if (v > today) return
                setPlayDate(v)
              }}
            />
          </label>
        </div>
      </div>

      <div className="rounded-xl border border-rift-border bg-rift-panel/80 p-3 sm:p-4">
        <p className="mb-3 text-xs text-slate-500">
          Game #1 is {minDate}. Future days are hidden.
        </p>
        <div className="max-h-[65vh] overflow-auto rounded-lg border border-white/10 bg-black/10">
          <div className="divide-y divide-white/5">
            {gameRows.map(({ n, ymd }) => {
              const status = playedMap.get(ymd)
              const isSelected = ymd === playDate
              return (
                <button
                  key={ymd}
                  type="button"
                  className={`flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition ${
                    isSelected ? 'bg-white/10' : 'hover:bg-white/5'
                  }`}
                  onClick={() => setPlayDate(ymd)}
                >
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-100">Game #{n}</p>
                    <p className="text-xs text-slate-500">{ymd}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    {status?.won ? (
                      <span className="rounded-md border border-emerald-800/40 bg-emerald-950/30 px-2 py-1 text-xs font-semibold text-emerald-200">
                        Won
                      </span>
                    ) : status?.complete ? (
                      <span className="rounded-md border border-white/10 bg-black/20 px-2 py-1 text-xs text-slate-300">
                        Played
                      </span>
                    ) : (
                      <span className="rounded-md border border-white/10 bg-black/10 px-2 py-1 text-xs text-slate-400">
                        Unplayed
                      </span>
                    )}
                    <span className="text-xs text-slate-600">→</span>
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {visibleCount < maxGameNumber && (
          <div className="mt-4 flex justify-center">
            <button
              type="button"
              className="rounded-md border border-rift-border bg-rift-bg px-4 py-2 text-sm text-slate-200 hover:border-slate-500"
              onClick={() => setPage((p) => p + 1)}
            >
              Load more
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
