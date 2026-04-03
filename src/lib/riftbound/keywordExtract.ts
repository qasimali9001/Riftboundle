import type { RiftcodexCard } from '../api/types'
import type { KeywordIndex } from '../api/keywordIndex'

/** Remove reminder text in parentheses that follows a bracket keyword, e.g. `[Tank] (I must...)` → `[Tank]` */
export function stripKeywordReminderParentheticals(plain: string): string {
  return plain.replace(/\]\s*\([^)]*\)/g, ']')
}

/** Remove `[Keyword]` from rules text when that keyword is already shown in the keyword row */
export function stripBracketKeywordsFromRules(plain: string, keywords: string[]): string {
  let s = plain
  for (const k of keywords) {
    const esc = k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    s = s.replace(new RegExp(`\\[${esc}\\]\\s*`, 'gi'), '')
  }
  return s
}

function canonical(idx: KeywordIndex, raw: string): string | null {
  const low = raw.trim().toLowerCase()
  return idx.lowerToCanonical.get(low) ?? null
}

/**
 * Game keywords only: tags ∩ official keyword list, plus [Keyword] markers in plain text
 * that match GET /index/keywords (excludes champion names, regions, etc.).
 */
export function extractCardKeywords(raw: RiftcodexCard, idx: KeywordIndex): string[] {
  const out = new Map<string, string>()

  for (const tag of raw.tags) {
    const c = canonical(idx, tag)
    if (c) out.set(c.toLowerCase(), c)
  }

  const plain = raw.text.plain
  const re = /\[[^\]]+\]/g
  let m: RegExpExecArray | null
  while ((m = re.exec(plain)) !== null) {
    const inner = m[0].slice(1, -1).trim()
    if (!inner || inner.includes(':')) continue
    const c = canonical(idx, inner)
    if (c) out.set(c.toLowerCase(), c)
  }

  return [...out.values()].sort((a, b) => a.localeCompare(b))
}
