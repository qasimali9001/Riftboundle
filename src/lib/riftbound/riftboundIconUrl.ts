/** Public folder: `public/riftbound-icons/<file>` — filenames match `:rb_*:` tokens (see manifest.json). */
export function riftboundIconUrl(filename: string): string {
  const base = import.meta.env.BASE_URL
  const prefix = base.endsWith('/') ? base : `${base}/`
  return `${prefix}riftbound-icons/${filename}`
}

const COLORED_RUNE_RE =
  /^rb_rune_(body|calm|chaos|fury|mind|order|rainbow)$/

const DOMAIN_SLUGS = new Set([
  'body',
  'calm',
  'chaos',
  'fury',
  'mind',
  'order',
])

/** Maps API `classification.domain` entry to `rb_rune_*.webp`, or `null` to fall back to coloured dot. */
export function domainRuneFilename(domain: string): string | null {
  const k = domain.trim().toLowerCase()
  if (k === 'rainbow') return 'rb_rune_rainbow.webp'
  if (DOMAIN_SLUGS.has(k)) return `rb_rune_${k}.webp`
  return null
}

/** Domain / wild runes in rules text — hidden until the domain hint is revealed. */
export function isColoredRuneToken(token: string): boolean {
  return COLORED_RUNE_RE.test(token.toLowerCase())
}

export function riftboundTokenIcon(
  token: string,
  opts?: { domainsHidden?: boolean },
): { filename: string; title: string } | null {
  const t = token.toLowerCase()
  if (opts?.domainsHidden && isColoredRuneToken(t)) {
    return { filename: 'rb_rune_unknown.webp', title: 'Domain hidden' }
  }
  if (t === 'rb_rune_unknown')
    return { filename: 'rb_rune_unknown.webp', title: 'Unknown rune' }
  if (t === 'rb_might') return { filename: 'rb_might.webp', title: 'Might' }
  if (t === 'rb_exhaust') return { filename: 'rb_exhaust.webp', title: 'Exhaust' }
  if (t === 'rb_rune_rainbow')
    return { filename: 'rb_rune_rainbow.webp', title: 'Wild' }
  const energy = /^rb_energy_(\d+)$/.exec(t)
  if (energy)
    return {
      filename: `rb_energy_${energy[1]}.webp`,
      title: `Energy ${energy[1]}`,
    }
  const rune = /^rb_rune_(body|calm|chaos|fury|mind|order)$/.exec(t)
  if (rune) {
    const name = rune[1]
    const title = name.charAt(0).toUpperCase() + name.slice(1)
    return { filename: `rb_rune_${name}.webp`, title }
  }
  if (t === 'rb_recycle') return null
  return null
}
