/**
 * Domain accent colours (match Riftbound rune identity: Fury red … Order yellow).
 * Tune against `public/riftbound-icons/rb_rune_*.webp` when those assets are present.
 */
const DOMAIN_HEX: Record<string, string> = {
  /** Deep red */
  fury: '#991b1b',
  /** Green */
  calm: '#15803d',
  /** Blue */
  mind: '#1d4ed8',
  /** Purple */
  chaos: '#7c3aed',
  /** Orange */
  body: '#ea580c',
  /** Yellow */
  order: '#eab308',
}

export function domainHex(name: string): string {
  const key = name.trim().toLowerCase()
  return DOMAIN_HEX[key] ?? '#64748b'
}
