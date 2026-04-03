import type { Card } from '../types'
import { CACHE_CARDS_KEY, CACHE_META_KEY } from '../config'
import { extractCardKeywords } from '../riftbound/keywordExtract'
import type { KeywordIndex } from './keywordIndex'
import { fetchKeywordIndexCached } from './keywordIndex'
import type { RiftcodexCard, RiftcodexCardsResponse } from './types'

function getApiBase(): string {
  if (import.meta.env.VITE_API_BASE) {
    return import.meta.env.VITE_API_BASE.replace(/\/$/, '')
  }
  if (import.meta.env.DEV) {
    return '/riftcodex'
  }
  return 'https://api.riftcodex.com'
}

function todayUtcDate(): string {
  return new Date().toISOString().slice(0, 10)
}

function shouldRefreshCache(metaJson: string | null): boolean {
  if (!metaJson) return true
  try {
    const meta = JSON.parse(metaJson) as { refreshedOn?: string }
    return meta.refreshedOn !== todayUtcDate()
  } catch {
    return true
  }
}

function normalizeCard(raw: RiftcodexCard, keywordIndex: KeywordIndex): Card {
  const e = raw.attributes.energy
  const m = raw.attributes.might
  const keywords = extractCardKeywords(raw, keywordIndex)
  return {
    id: String(raw.id),
    name: raw.name,
    manaCost: m != null ? String(m) : '—',
    energyCost: e != null ? String(e) : '—',
    text: raw.text.plain,
    keywords,
    color: [...raw.classification.domain],
    image: raw.media.image_url,
    cardType: raw.classification.type,
    supertype: raw.classification.supertype,
  }
}

function isPlayableCard(raw: RiftcodexCard): boolean {
  const st = raw.classification.supertype
  if (st && st.toLowerCase() === 'token') return false
  if (raw.classification.type.toLowerCase() === 'token') return false
  return true
}

function cardsListUrl(base: string): URL {
  const path = `${base.replace(/\/$/, '')}/cards`
  // Absolute API origin — single-arg URL is fine.
  if (/^https?:\/\//i.test(base)) {
    return new URL(path)
  }
  // Dev proxy path like `/riftcodex` — must supply a base (relative URLs are invalid alone).
  const origin =
    typeof window !== 'undefined' && window.location?.origin
      ? window.location.origin
      : 'http://localhost:5173'
  return new URL(path.startsWith('/') ? path : `/${path}`, origin)
}

async function fetchPage(
  base: string,
  page: number,
  size: number,
): Promise<RiftcodexCardsResponse> {
  const url = cardsListUrl(base)
  url.searchParams.set('sort', 'name')
  url.searchParams.set('dir', '1')
  url.searchParams.set('page', String(page))
  url.searchParams.set('size', String(size))
  const res = await fetch(url.toString())
  if (!res.ok) {
    throw new Error(`Cards request failed: ${res.status}`)
  }
  return res.json() as Promise<RiftcodexCardsResponse>
}

/** Fetch all pages, filter playable cards, sort by id for stable daily index. */
export async function fetchAllCards(forceNetwork = false): Promise<Card[]> {
  const base = getApiBase()

  if (!forceNetwork && typeof localStorage !== 'undefined') {
    const meta = localStorage.getItem(CACHE_META_KEY)
    const raw = localStorage.getItem(CACHE_CARDS_KEY)
    if (raw && !shouldRefreshCache(meta)) {
      try {
        const parsed = JSON.parse(raw) as Card[]
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed
        }
      } catch {
        /* fall through */
      }
    }
  }

  const keywordIndex = await fetchKeywordIndexCached(getApiBase)

  const pageSize = 100
  const first = await fetchPage(base, 1, pageSize)
  const all: RiftcodexCard[] = [...first.items]
  const pages = first.pages
  for (let p = 2; p <= pages; p += 1) {
    const chunk = await fetchPage(base, p, pageSize)
    all.push(...chunk.items)
  }

  const filtered = all.filter(isPlayableCard).map((r) => normalizeCard(r, keywordIndex))
  filtered.sort((a, b) => a.id.localeCompare(b.id))

  if (typeof localStorage !== 'undefined') {
    try {
      localStorage.setItem(CACHE_CARDS_KEY, JSON.stringify(filtered))
      localStorage.setItem(
        CACHE_META_KEY,
        JSON.stringify({ refreshedOn: todayUtcDate(), count: filtered.length }),
      )
    } catch {
      /* ignore quota */
    }
  }

  return filtered
}
