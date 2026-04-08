import { useEffect, useState } from 'react'
import { DateControls } from './features/archive/DateControls'
import { PreviousGamesPage } from './features/archive/PreviousGamesPage'
import { GamePanel } from './features/game/GamePanel'
import { GuessInput } from './features/game/GuessInput'
import { HintBar } from './features/hints/HintBar'
import { useGameStore } from './store/useGameStore'

export default function App() {
  const [view, setView] = useState<'play' | 'previous'>('play')
  const loadState = useGameStore((s) => s.loadState)
  const loadError = useGameStore((s) => s.loadError)
  const loadCards = useGameStore((s) => s.loadCards)

  useEffect(() => {
    loadCards()
  }, [loadCards])

  return (
    <div className="no-word-split mx-auto flex min-h-screen max-w-lg flex-col px-4 pb-16 pt-8 md:max-w-xl">
      <header className="mb-6 text-center">
        <h1 className="font-display text-3xl font-bold tracking-tight text-white md:text-4xl">
          Riftboundle
        </h1>
        <p className="mt-2 text-sm text-slate-400">
          Guess today&apos;s Riftbound card. Data from{' '}
          <a
            className="text-rift-accent underline-offset-2 hover:underline"
            href="https://riftcodex.com"
            target="_blank"
            rel="noreferrer"
          >
            Riftcodex
          </a>
          .
        </p>
      </header>

      {loadState === 'loading' && (
        <p className="text-center text-slate-400">Loading Card Database…</p>
      )}

      {loadState === 'error' && (
        <div className="rounded-lg border border-red-900/50 bg-red-950/40 p-4 text-center text-red-200">
          <p>{loadError}</p>
          <button
            type="button"
            className="mt-3 rounded-md bg-red-900/80 px-4 py-2 text-sm font-medium text-white hover:bg-red-800"
            onClick={() => loadCards()}
          >
            Retry
          </button>
        </div>
      )}

      {loadState === 'ready' &&
        (view === 'previous' ? (
          <PreviousGamesPage onBack={() => setView('play')} />
        ) : (
          <>
            <DateControls onOpenPreviousGames={() => setView('previous')} />
            <GamePanel />
            <GuessInput />
            <HintBar />
          </>
        ))}

      <footer className="mt-auto pt-12 text-center text-xs text-slate-600">
        Not affiliated with Riot Games. Fan project for fun.
      </footer>
    </div>
  )
}
