import type { Ordering } from '@/api/types'

/**
 * Fixed per-category accents. Tailwind cannot see a class name that is built at
 * runtime, so every variant is spelled out here in full.
 *
 * Accent colour is confined to four places — the eyebrow label, the category
 * pill, the 3px rule on the card edge, and the active nav indicator. It never
 * floods a background.
 */
export interface CategoryStyle {
  /** Accent as text — the eyebrow and pill label. */
  text: string
  /** Accent tint as a background — pill and monogram tile only. */
  tint: string
  /** The 3px rule down the card's leading edge. */
  rule: string
  /** Accent as a border — active pill outline. */
  border: string
  /** Tint on hover, for an inactive pill. */
  hover: string
}

const BRAND_STYLE: CategoryStyle = {
  text: 'text-brand',
  tint: 'bg-brand-tint',
  rule: 'border-l-brand',
  border: 'border-brand',
  hover: 'hover:bg-brand-tint',
}

const CATEGORY_STYLES: Record<string, CategoryStyle> = {
  tech: {
    text: 'text-tech',
    tint: 'bg-tech-tint',
    rule: 'border-l-tech',
    border: 'border-tech',
    hover: 'hover:bg-tech-tint',
  },
  world: {
    text: 'text-world',
    tint: 'bg-world-tint',
    rule: 'border-l-world',
    border: 'border-world',
    hover: 'hover:bg-world-tint',
  },
  business: {
    text: 'text-business',
    tint: 'bg-business-tint',
    rule: 'border-l-business',
    border: 'border-business',
    hover: 'hover:bg-business-tint',
  },
  sports: {
    text: 'text-sports',
    tint: 'bg-sports-tint',
    rule: 'border-l-sports',
    border: 'border-sports',
    hover: 'hover:bg-sports-tint',
  },
}

/**
 * Falls back to brand rather than throwing. The four slugs are stable, but a
 * fifth category appearing in the pipeline must not render an unstyled card.
 */
export function categoryStyle(slug: string | undefined): CategoryStyle {
  return (slug && CATEGORY_STYLES[slug]) || BRAND_STYLE
}

export const ORDERING_OPTIONS: ReadonlyArray<{
  value: Ordering
  label: string
}> = [
  { value: '-published_at', label: 'Newest first' },
  { value: 'published_at', label: 'Oldest first' },
  { value: '-collected_at', label: 'Recently collected' },
]

export const DEFAULT_ORDERING: Ordering = '-published_at'

/** Matches the API default. Larger pages make the first paint slower. */
export const PAGE_SIZE = 20

/** The pipeline writes on this cadence; shown on the freshness strip. */
export const REFRESH_INTERVAL_MINUTES = 30

/** Feed column counts. Mirrors the breakpoints in `.CLAUDE/requirements.md`. */
export const BREAKPOINT_TABLET = '(min-width: 768px)'
export const BREAKPOINT_DESKTOP = '(min-width: 1024px)'

/**
 * Row height estimates per column count, used before a row has been measured.
 * Fewer columns means wider cards, so headlines wrap to fewer lines.
 */
export const ROW_ESTIMATE: Record<number, number> = { 1: 208, 2: 232, 3: 248 }

/** How close to the end of the list the next page starts loading, in rows. */
export const PREFETCH_ROWS = 3
