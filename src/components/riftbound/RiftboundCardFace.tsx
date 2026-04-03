import type { ReactNode } from 'react'
import type { Card } from '../../lib/types'
import { applyLetterReveals } from '../../lib/utils/mask'
import { domainHex } from '../../lib/utils/domainColors'
import { CostPlate, MightPlate } from './costPlate'
import { InlineRuleText } from './InlineRuleText'

const FRAME_BOX_SHADOW =
  '0 20px 50px rgba(0,0,0,0.65), inset 0 1px 0 rgba(255,255,255,0.06)'

const INNER_PANEL =
  'bg-gradient-to-b from-zinc-800/95 via-zinc-900 to-zinc-950'

/**
 * Outer “ring” is only `padding` filled with a solid/gradient colour — no `border` property,
 * so the accent always paints visibly in every browser.
 */
function CardFrameChrome({
  card,
  showDomainAccent,
  children,
}: {
  card: Card
  showDomainAccent: boolean
  children: ReactNode
}) {
  const domains = card.color

  const ringBackground =
    !showDomainAccent || domains.length === 0
      ? '#71717a'
      : domains.length === 1
        ? domainHex(domains[0])
        : `linear-gradient(135deg, ${domains.map((d) => domainHex(d)).join(', ')})`

  return (
    <div
      className="rounded-[14px] p-[4px] transition-[background,box-shadow] duration-500"
      style={{ background: ringBackground, boxShadow: FRAME_BOX_SHADOW }}
    >
      <div className={`min-h-0 overflow-hidden rounded-[11px] ${INNER_PANEL}`}>
        {children}
      </div>
    </div>
  )
}

function TypeLineBar({
  card,
  classificationRevealed,
  domainsHidden,
}: {
  card: Card
  classificationRevealed: boolean
  domainsHidden: boolean
}) {
  const domains = card.color

  const domainSpans = (className: string) =>
    domains.length === 0 ? (
      <span className={className}>—</span>
    ) : (
      domains.map((d, i) => (
        <span key={`${d}-${i}`}>
          {i > 0 && <span className="text-zinc-600"> • </span>}
          <span className="font-bold" style={{ color: domainHex(d) }}>
            {d.toUpperCase()}
          </span>
        </span>
      ))
    )

  if (classificationRevealed) {
    const left = [card.supertype, card.cardType].filter(Boolean).join(' ')
    return (
      <div className="border-y border-zinc-600/55 bg-zinc-900/50 px-2 py-1.5 text-center transition-colors duration-500">
        <p className="text-[10px] font-bold uppercase leading-snug tracking-wide">
          {left ? <span className="text-zinc-200/95">{left}</span> : null}
          {left && domains.length > 0 ? <span className="text-zinc-600"> • </span> : null}
          {domainSpans('text-zinc-500')}
        </p>
      </div>
    )
  }

  if (!domainsHidden) {
    return (
      <div className="border-y border-zinc-600/55 bg-zinc-900/50 px-2 py-1.5 text-center transition-colors duration-500">
        <p className="text-[10px] font-bold uppercase leading-snug tracking-wide">
          <span className="text-zinc-500">? ? ?</span>
          <span className="text-zinc-600"> • </span>
          <span className="text-zinc-500">? ? ?</span>
          <span className="text-zinc-600"> • </span>
          {domainSpans('text-zinc-500')}
        </p>
      </div>
    )
  }

  return (
    <div className="border-y border-zinc-600/45 bg-zinc-900/55 px-2 py-1.5 text-center">
      <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
        ? ? ? • ? ? ? • ? ? ?
      </p>
    </div>
  )
}

/**
 * Art region: classic Riftbound silhouette while guessing (`object-cover`);
 * after a win, full artwork with letterboxing (`object-contain`) so nothing is cropped.
 */
export function OfficialCardArt({
  card,
  artRevealed,
  showGameplayOverlay = false,
  domainsHidden = true,
  mightRevealed = false,
  classificationRevealed = false,
  fullReveal = false,
  embedded = false,
  className = '',
}: {
  card: Card
  artRevealed: boolean
  showGameplayOverlay?: boolean
  domainsHidden?: boolean
  mightRevealed?: boolean
  classificationRevealed?: boolean
  /** Solved / win: show full image without cropping inside the art frame */
  fullReveal?: boolean
  /** Inside {@link CardFrameChrome} — no extra outer rounding/shadow */
  embedded?: boolean
  className?: string
}) {
  const imgFit = fullReveal ? 'object-contain object-center' : 'object-cover object-center'

  return (
    <div
      className={`relative aspect-[744/585] w-full overflow-hidden bg-black ${
        embedded ? '' : 'rounded-xl shadow-lg shadow-black/40'
      } ${className}`}
    >
      {card.image ? (
        <img
          src={card.image}
          alt=""
          className={`h-full w-full transition-all duration-500 ${imgFit} ${
            artRevealed
              ? 'opacity-100'
              : 'scale-105 opacity-[0.18] blur-2xl grayscale'
          }`}
          draggable={false}
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-900 to-black text-slate-600">
          No art
        </div>
      )}
      {!artRevealed && (
        <div
          className="pointer-events-none absolute inset-0 bg-[repeating-linear-gradient(135deg,rgba(0,0,0,0.15)_0px,rgba(0,0,0,0.15)_8px,rgba(30,30,30,0.1)_8px,rgba(30,30,30,0.1)_16px)]"
          aria-hidden
        />
      )}
      {showGameplayOverlay && (
        <>
          <div className="absolute left-2 top-2 z-10">
            <CostPlate card={card} domainsHidden={domainsHidden} />
          </div>
          <div className="absolute right-2 top-2 z-10">
            <MightPlate card={card} revealed={mightRevealed} />
          </div>
          <div className="absolute bottom-0 left-0 right-0 z-10 px-1 pb-1">
            <TypeLineBar
              card={card}
              classificationRevealed={classificationRevealed}
              domainsHidden={domainsHidden}
            />
          </div>
        </>
      )}
    </div>
  )
}

function letterSet(letters: string[]): Set<string> {
  return new Set(letters.map((l) => l.toLowerCase()))
}

function allLettersInCard(name: string, text: string): Set<string> {
  const s = new Set<string>()
  for (const ch of (name + text).toLowerCase()) {
    if (/[a-z]/.test(ch)) s.add(ch)
  }
  return s
}

function MaskedTitle({
  text,
  revealed,
}: {
  text: string
  revealed: Set<string>
}) {
  const chars = Array.from(text)
  return (
    <h2 className="font-display flex flex-wrap justify-center gap-x-0.5 gap-y-0.5 text-lg font-bold leading-tight text-zinc-100 md:gap-x-1 md:text-xl">
      {chars.map((ch, i) => (
        <span
          key={`title-ch-${i}`}
          className="inline-flex min-w-[0.45em] justify-center tabular-nums"
        >
          {applyLetterReveals(ch, revealed)}
        </span>
      ))}
    </h2>
  )
}

function TypeLineInline({ card }: { card: Card }) {
  const domains = card.color
  const left = [card.supertype, card.cardType].filter(Boolean).join(' ')
  return (
    <div className="mt-2 text-center">
      <p className="text-[10px] font-bold uppercase leading-snug tracking-wide text-zinc-400">
        {left ? <span className="text-zinc-300">{left}</span> : null}
        {left && domains.length > 0 ? <span className="text-zinc-600"> • </span> : null}
        {domains.length === 0 ? (
          <span className="text-zinc-500">—</span>
        ) : (
          domains.map((d, i) => (
            <span key={`${d}-${i}`}>
              {i > 0 && <span className="text-zinc-600"> • </span>}
              <span className="font-bold" style={{ color: domainHex(d) }}>
                {d.toUpperCase()}
              </span>
            </span>
          ))
        )}
      </p>
    </div>
  )
}

/**
 * Framed “daily puzzle” card — guessing only (blurred art, plates, type line, masked text).
 * After a correct guess, swap to {@link RiftboundRevealedCard} instead.
 */
export function RiftboundCardFace({
  card,
  revealed,
  revealedLetters,
  domainsHidden,
}: {
  card: Card
  revealed: {
    keywords: boolean
    might: boolean
    classification: boolean
  }
  revealedLetters: string[]
  domainsHidden: boolean
}) {
  const rs = letterSet(revealedLetters)
  const mightRevealed = revealed.might
  const classificationRevealed = revealed.classification

  const showDomainAccent = !domainsHidden || classificationRevealed

  return (
    <div className="relative mx-auto w-full max-w-[400px]">
      <CardFrameChrome card={card} showDomainAccent={showDomainAccent}>
        <div className="overflow-hidden rounded-[10px] border border-zinc-700/45 bg-zinc-950">
          <OfficialCardArt
            card={card}
            artRevealed={false}
            showGameplayOverlay
            domainsHidden={domainsHidden}
            mightRevealed={mightRevealed}
            classificationRevealed={classificationRevealed}
            fullReveal={false}
            embedded
          />

          <div className="border-t-2 border-zinc-700/45 bg-gradient-to-b from-zinc-900/90 to-zinc-950 px-4 pb-4 pt-3">
            <div className="mb-3 border-b border-zinc-700/35 pb-3">
              <MaskedTitle text={card.name} revealed={rs} />
            </div>
            <div>
              <div className="mb-1.5 text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                Card description
              </div>
              <div className="text-[13px] leading-relaxed">
                <InlineRuleText
                  plain={card.text}
                  revealed={rs}
                  domainsHidden={domainsHidden}
                  bracketKeywords={card.keywords}
                  stripDuplicateKeywordBrackets={revealed.keywords}
                />
              </div>
            </div>
          </div>
        </div>
      </CardFrameChrome>
    </div>
  )
}

/**
 * Shown after a correct guess: real card art (no frame / no gameplay chrome on the image) plus full text.
 */
export function RiftboundRevealedCard({
  card,
  revealed,
}: {
  card: Card
  revealed: { keywords: boolean }
}) {
  const rs = allLettersInCard(card.name, card.text)

  return (
    <div className="relative mx-auto w-full max-w-[400px]">
      <OfficialCardArt
        card={card}
        artRevealed
        showGameplayOverlay={false}
        domainsHidden={false}
        fullReveal
        embedded={false}
      />
      <div className="mt-4 rounded-xl border border-zinc-700/50 bg-gradient-to-b from-zinc-900/90 to-zinc-950 px-4 pb-4 pt-3 shadow-inner">
        <div className="mb-3 border-b border-zinc-700/35 pb-3">
          <MaskedTitle text={card.name} revealed={rs} />
          <TypeLineInline card={card} />
        </div>
        <div>
          <div className="mb-1.5 text-[10px] font-bold uppercase tracking-wider text-zinc-500">
            Card description
          </div>
          <div className="text-[13px] leading-relaxed">
            <InlineRuleText
              plain={card.text}
              revealed={rs}
              domainsHidden={false}
              bracketKeywords={card.keywords}
              stripDuplicateKeywordBrackets={revealed.keywords}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
