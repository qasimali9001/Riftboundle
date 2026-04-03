/**
 * Deterministic 32-bit FNV-1a hash for UTF-8-ish strings (code units).
 * Same input yields same index across clients for a given sorted card list.
 */
export function fnv1a32(input: string): number {
  let hash = 0x811c9dc5
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i)
    hash = Math.imul(hash, 0x01000193)
  }
  return hash >>> 0
}

/** UTC calendar day `YYYY-MM-DD` → index into list of length `len` */
export function dailyIndex(dateUtcYmd: string, len: number): number {
  if (len <= 0) return 0
  return fnv1a32(dateUtcYmd) % len
}
