/** Formatting helpers. Pure, and covered by `format.test.ts`. */

/**
 * Splits on whitespace and every dash we actually see in the data. Several
 * source names use an EN DASH (U+2013) rather than a hyphen — "BBC News – World",
 * "The Guardian – Business" — and splitting on `-` alone leaves them as one word.
 * The range covers U+2010 hyphen through U+2015 horizontal bar.
 */
const WORD_SEPARATORS = /[\s‐-―\-/·|,.]+/

/**
 * Two uppercase letters identifying a publisher. Sources have no logo and no
 * `homepage_url`, so this tile is the entire visual identity of a source.
 *
 *   The Verge          → TV     (initials of the first two words)
 *   BBC News – World   → BN
 *   Ars Technica       → AT
 *   TechCrunch         → TC     (single word: its internal capitals)
 *   ESPN               → ES     (single word, all caps: first two letters)
 */
export function monogram(name: string): string {
  const words = name.split(WORD_SEPARATORS).filter(Boolean)

  if (words.length === 0) return '??'

  if (words.length >= 2) {
    return `${words[0]!.charAt(0)}${words[1]!.charAt(0)}`.toUpperCase()
  }

  const word = words[0]!
  const capitals = word.match(/[A-Z]/g) ?? []

  // "TechCrunch" → TC. An all-caps acronym ("ESPN") matches every letter, so
  // this collapses to the first two either way.
  if (capitals.length >= 2) {
    return `${capitals[0]!}${capitals[1]!}`.toUpperCase()
  }

  return word.slice(0, 2).toUpperCase().padEnd(2, word.charAt(0).toUpperCase())
}

const MINUTE = 60_000
const HOUR = 60 * MINUTE
const DAY = 24 * HOUR

/**
 * Compact relative time for metadata rows: `now`, `34m`, `3h`, `2d`.
 * Deliberately terse — it sits in an 11px uppercase row between middots.
 */
export function relativeTime(iso: string, now: number = Date.now()): string {
  const elapsed = now - new Date(iso).getTime()

  if (Number.isNaN(elapsed)) return ''
  if (elapsed < MINUTE) return 'now'
  if (elapsed < HOUR) return `${Math.floor(elapsed / MINUTE)}m`
  if (elapsed < DAY) return `${Math.floor(elapsed / HOUR)}h`
  if (elapsed < 30 * DAY) return `${Math.floor(elapsed / DAY)}d`

  return new Date(iso).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  })
}

const relative = new Intl.RelativeTimeFormat(undefined, { numeric: 'auto' })

/** Long form for prose and the freshness strip: "12 minutes ago". */
export function relativeTimeLong(iso: string, now: number = Date.now()): string {
  const elapsed = now - new Date(iso).getTime()

  if (Number.isNaN(elapsed)) return ''
  if (elapsed < MINUTE) return 'just now'
  if (elapsed < HOUR) return relative.format(-Math.floor(elapsed / MINUTE), 'minute')
  if (elapsed < DAY) return relative.format(-Math.floor(elapsed / HOUR), 'hour')

  return relative.format(-Math.floor(elapsed / DAY), 'day')
}

/** Absolute timestamp for the `dateTime`-adjacent title attribute. */
export function absoluteTime(iso: string): string {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return ''

  return date.toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}

/**
 * The publisher destination, shown in small mono on the handoff panel so the
 * user knows where they are going before they click.
 */
export function displayUrl(url: string, maxLength = 48): string {
  let readable = url
  try {
    const parsed = new URL(url)
    readable = `${parsed.hostname.replace(/^www\./, '')}${parsed.pathname}`
  } catch {
    // Not a parseable URL — show it raw rather than hiding the destination.
  }

  readable = readable.replace(/\/$/, '')
  return readable.length > maxLength
    ? `${readable.slice(0, maxLength - 1)}…`
    : readable
}

/** "517 stories" / "1 story" — used in headings and live regions. */
export function pluralise(count: number, singular: string, plural: string): string {
  return `${count.toLocaleString()} ${count === 1 ? singular : plural}`
}
