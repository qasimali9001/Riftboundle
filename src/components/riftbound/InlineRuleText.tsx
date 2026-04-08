import { Fragment } from 'react'
import { applyLetterReveals } from '../../lib/utils/mask'
import {
  stripBracketKeywordsFromRules,
  stripKeywordReminderParentheticals,
} from '../../lib/riftbound/keywordExtract'
import { riftboundIconUrl, riftboundTokenIcon } from '../../lib/riftbound/riftboundIconUrl'

const TEXT_SECTION_BREAK = 'text_section_break.png'

/**
 * Matched against **masked** rules (same length as plain) so `[Keyword]` → `[____]` still splits.
 * Run after `stripKeywordReminderParentheticals` / `stripBracketKeywordsFromRules`.
 *
 * Matches: `[*]`, `[ * ]`, `[_ _ _ _]`, `［＊］`, and `[____]` from masked keyword brackets.
 */
const SECTION_BREAK_PLACEHOLDER =
  /(?:\[\s*\*\s*\]|\[(?:\s*_\s*)+\]|[\uFF3B]\s*[\uFF0A]\s*[\uFF3D])/g

type Seg = { kind: 'text'; value: string } | { kind: 'icon'; token: string }

/**
 * Split `plain` at every region where `masked` matches the section-break pattern.
 * `masked` must be the same length as `plain` (e.g. from `applyLetterReveals`) so indices align.
 * This fixes `[Tank]` → `[____]` on screen: we detect breaks on masked text, slice original `plain`.
 */
function splitPlainUsingMaskedMatches(
  plain: string,
  masked: string,
  re: RegExp,
): string[] {
  if (plain.length !== masked.length) {
    return [plain]
  }
  const chunks: string[] = []
  let last = 0
  const r = new RegExp(re.source, 'g')
  let m: RegExpExecArray | null
  while ((m = r.exec(masked)) !== null) {
    chunks.push(plain.slice(last, m.index))
    last = m.index + m[0].length
  }
  chunks.push(plain.slice(last))
  return chunks
}

function parseSegments(plain: string): Seg[] {
  const out: Seg[] = []
  const re = /:([a-z0-9_]+):/gi
  let last = 0
  let m: RegExpExecArray | null
  while ((m = re.exec(plain)) !== null) {
    if (m.index > last) {
      out.push({ kind: 'text', value: plain.slice(last, m.index) })
    }
    out.push({ kind: 'icon', token: m[1].toLowerCase() })
    last = m.index + m[0].length
  }
  if (last < plain.length) {
    out.push({ kind: 'text', value: plain.slice(last) })
  }
  return out
}

const INLINE_ICON_CLASS =
  'mx-0.5 inline-block h-[1.2em] w-[1.2em] shrink-0 align-[-0.22em] object-contain drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]'

function InlineToken({
  token,
  domainsHidden,
}: {
  token: string
  domainsHidden: boolean
}) {
  const mapped = riftboundTokenIcon(token, { domainsHidden })
  if (mapped) {
    return (
      <img
        src={riftboundIconUrl(mapped.filename)}
        alt=""
        role="presentation"
        className={INLINE_ICON_CLASS}
        title={mapped.title}
        loading="lazy"
        decoding="async"
      />
    )
  }
  return (
    <span className="mx-0.5 rounded bg-slate-800 px-1 font-mono text-[10px] text-slate-400" title={token}>
      :{token}:
    </span>
  )
}

export function InlineRuleText({
  plain,
  revealed,
  domainsHidden = false,
  bracketKeywords = [],
  stripDuplicateKeywordBrackets,
}: {
  plain: string
  revealed: Set<string>
  /** Until domain hint — colored runes in rules show as `rb_rune_unknown` */
  domainsHidden?: boolean
  /** Keywords also shown as lime pills — strip `[Name]` from rules to avoid duplicate */
  bracketKeywords?: string[]
  /** When keyword hint is on (or win), remove bracket copies from rules */
  stripDuplicateKeywordBrackets?: boolean
}) {
  let cleaned = stripKeywordReminderParentheticals(plain)
  if (stripDuplicateKeywordBrackets && bracketKeywords.length > 0) {
    cleaned = stripBracketKeywordsFromRules(cleaned, bracketKeywords)
  }
  const masked = applyLetterReveals(cleaned, revealed)
  const chunks = splitPlainUsingMaskedMatches(cleaned, masked, SECTION_BREAK_PLACEHOLDER)

  return (
    <div className="min-w-0 break-words whitespace-pre-wrap text-[13px] leading-relaxed text-slate-200/95">
      {chunks.map((chunk, chunkIdx) => (
        <Fragment key={`c-${chunkIdx}`}>
          {chunkIdx > 0 && (
            <div className="my-2 w-full shrink-0" aria-hidden>
              <img
                src={riftboundIconUrl(TEXT_SECTION_BREAK)}
                alt=""
                role="presentation"
                className="block h-3.5 w-[3.625rem] max-w-[min(100%,6rem)] object-contain object-left"
                title=""
                loading="lazy"
                decoding="async"
              />
            </div>
          )}
          {parseSegments(chunk).map((seg, i) => {
            if (seg.kind === 'icon') {
              return (
                <InlineToken
                  key={`i-${chunkIdx}-${i}`}
                  token={seg.token}
                  domainsHidden={domainsHidden}
                />
              )
            }
            return (
              <span key={`t-${chunkIdx}-${i}`}>
                {applyLetterReveals(seg.value, revealed)}
              </span>
            )
          })}
        </Fragment>
      ))}
    </div>
  )
}
