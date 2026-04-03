import { KEYWORD_INDEX_KEY, KEYWORD_INDEX_META_KEY } from '../config'

type KeywordIndexResponse = {
  total: number
  type: string
  values: string[]
}

function todayUtcDate(): string {
  return new Date().toISOString().slice(0, 10)
}

function shouldRefreshKeywordMeta(metaJson: string | null): boolean {
  if (!metaJson) return true
  try {
    const meta = JSON.parse(metaJson) as { refreshedOn?: string }
    return meta.refreshedOn !== todayUtcDate()
  } catch {
    return true
  }
}

export type KeywordIndex = {
  /** Canonical display strings from API (e.g. "Quick-Draw") */
  values: string[]
  /** Lowercase -> canonical */
  lowerToCanonical: Map<string, string>
}

function buildIndex(values: string[]): KeywordIndex {
  const lowerToCanonical = new Map<string, string>()
  for (const v of values) {
    const t = v.trim()
    if (!t || /^\d+$/.test(t)) continue
    const low = t.toLowerCase()
    if (!lowerToCanonical.has(low)) lowerToCanonical.set(low, t)
  }
  return {
    values: [...new Set(values.map((v) => v.trim()).filter((v) => v && !/^\d+$/.test(v)))],
    lowerToCanonical,
  }
}

async function fetchKeywordIndexFromApi(base: string): Promise<KeywordIndex> {
  const url = `${base.replace(/\/$/, '')}/index/keywords`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Keyword index failed: ${res.status}`)
  const data = (await res.json()) as KeywordIndexResponse
  return buildIndex(data.values ?? [])
}

export async function fetchKeywordIndexCached(getApiBase: () => string): Promise<KeywordIndex> {
  const base = getApiBase()

  if (typeof localStorage !== 'undefined') {
    const meta = localStorage.getItem(KEYWORD_INDEX_META_KEY)
    const raw = localStorage.getItem(KEYWORD_INDEX_KEY)
    if (raw && !shouldRefreshKeywordMeta(meta)) {
      try {
        const values = JSON.parse(raw) as string[]
        if (Array.isArray(values) && values.length > 0) {
          return buildIndex(values)
        }
      } catch {
        /* fall through */
      }
    }
  }

  const idx = await fetchKeywordIndexFromApi(base)

  if (typeof localStorage !== 'undefined') {
    try {
      localStorage.setItem(KEYWORD_INDEX_KEY, JSON.stringify(idx.values))
      localStorage.setItem(
        KEYWORD_INDEX_META_KEY,
        JSON.stringify({ refreshedOn: todayUtcDate() }),
      )
    } catch {
      /* ignore */
    }
  }

  return idx
}
