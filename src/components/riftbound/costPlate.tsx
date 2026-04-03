import type { Card } from '../../lib/types'
import { domainRuneFilename, riftboundIconUrl } from '../../lib/riftbound/riftboundIconUrl'
import { domainHex } from '../../lib/utils/domainColors'

function parseStat(s: string): number | null {
  if (s === '—' || !String(s).trim()) return null
  const n = Number(s)
  return Number.isFinite(n) ? n : null
}

/** Energy number in the top-left circle (play cost). */
export function energyCostNumber(card: Card): string {
  const energy = parseStat(card.energyCost)
  if (energy != null) return String(energy)
  return '—'
}

/**
 * Top-left: energy, then domain rune row.
 * Until the domain hint is revealed — unknown rune; after — one icon per domain.
 */
export function CostPlate({
  card,
  domainsHidden,
}: {
  card: Card
  domainsHidden: boolean
}) {
  const energy = energyCostNumber(card)
  const domains = card.color

  return (
    <div className="flex flex-col items-center gap-1 rounded-lg border border-zinc-600/60 bg-black/80 px-2 py-1.5 shadow-lg backdrop-blur-sm">
      <div className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-zinc-300 bg-zinc-950 text-base font-bold tabular-nums text-white">
        {energy}
      </div>
      <div className="flex min-h-[1.25rem] flex-wrap justify-center gap-0.5">
        {domains.length === 0 ? (
          <span className="text-[10px] text-zinc-500">—</span>
        ) : (
          domains.map((d, i) => {
            const fn = domainRuneFilename(d)
            const src = fn ? riftboundIconUrl(fn) : null
            return (
              <span key={`${d}-${i}`} className="inline-flex h-5 w-5 items-center justify-center">
                {domainsHidden ? (
                  <img
                    src={riftboundIconUrl('rb_rune_unknown.webp')}
                    alt=""
                    className="h-full w-full object-contain"
                    draggable={false}
                  />
                ) : src ? (
                  <img
                    src={src}
                    alt=""
                    title={d}
                    className="h-full w-full object-contain"
                    draggable={false}
                  />
                ) : (
                  <span
                    className="block h-2.5 w-2.5 rounded-full shadow-sm ring-1 ring-white/20"
                    style={{ backgroundColor: domainHex(d) }}
                    title={d}
                  />
                )}
              </span>
            )
          })
        )}
      </div>
    </div>
  )
}

/** Top-right: Might icon + value (hidden as “?” until hint). */
export function MightPlate({
  card,
  revealed,
}: {
  card: Card
  revealed: boolean
}) {
  const raw = String(card.manaCost ?? '').trim()
  const mightNum = parseStat(raw)
  const showDash = revealed && (raw === '—' || raw === '' || mightNum === null)

  return (
    <div className="flex items-center gap-1 rounded-lg border border-zinc-600/60 bg-black/80 px-2 py-1 shadow-lg backdrop-blur-sm">
      <img
        src={riftboundIconUrl('rb_might.webp')}
        alt=""
        className="h-7 w-7 shrink-0 object-contain"
        draggable={false}
      />
      <span className="min-w-[1.5rem] text-center font-display text-lg font-bold tabular-nums text-white">
        {!revealed ? '?' : showDash ? '—' : mightNum != null ? String(mightNum) : '—'}
      </span>
    </div>
  )
}
