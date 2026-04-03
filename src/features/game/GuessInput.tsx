import { useEffect, useRef, useState } from 'react'
import type { Card } from '../../lib/types'
import { useGameStore } from '../../store/useGameStore'

export function GuessInput() {
  const game = useGameStore((s) => s.game)
  const submitGuess = useGameStore((s) => s.submitGuess)
  const searchCardNames = useGameStore((s) => s.searchCardNames)

  const [q, setQ] = useState('')
  const [open, setOpen] = useState(false)
  const boxRef = useRef<HTMLDivElement>(null)

  const suggestions: Card[] = open && q.trim() ? searchCardNames(q) : []

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!boxRef.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [])

  if (!game || game.isComplete) {
    return null
  }

  function pick(c: Card) {
    setQ(c.name)
    setOpen(false)
    submitGuess(c.name)
    setQ('')
  }

  return (
    <div className="relative z-10 mt-4" ref={boxRef}>
      <label className="mb-2 block text-sm font-medium text-slate-300">Guess card</label>
      <div className="flex gap-2">
        <input
          type="text"
          autoComplete="off"
          placeholder="Guess card…"
          className="flex-1 rounded-lg border-2 border-slate-600/80 bg-[#f8fafc] px-4 py-3 text-slate-900 shadow-inner placeholder:text-slate-500 outline-none focus:border-rift-accent focus:ring-2 focus:ring-rift-accent/40"
          value={q}
          onChange={(e) => {
            setQ(e.target.value)
            setOpen(true)
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              submitGuess(q)
              setQ('')
              setOpen(false)
            }
          }}
        />
        <button
          type="button"
          className="rounded-lg bg-rift-accent px-5 py-3 font-medium text-white hover:bg-blue-500 disabled:opacity-40"
          disabled={!q.trim()}
          onClick={() => {
            submitGuess(q)
            setQ('')
            setOpen(false)
          }}
        >
          Guess
        </button>
      </div>
      {suggestions.length > 0 && (
        <ul className="absolute mt-1 max-h-60 w-full overflow-auto rounded-lg border border-rift-border bg-rift-panel py-1 shadow-2xl">
          {suggestions.map((c) => (
            <li key={c.id}>
              <button
                type="button"
                className="w-full px-4 py-2 text-left text-sm text-slate-200 hover:bg-slate-800/80"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => pick(c)}
              >
                {c.name}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
