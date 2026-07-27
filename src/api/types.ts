/**
 * Types for the Django/DRF news API.
 *
 * These mirror the real serializer output, verified against the running server
 * — see `.CLAUDE/api-docs.md`. Two shapes here are load-bearing:
 *
 *   - `author` and `image_url` are `string` and are frequently `""`. Only
 *     `ai_summary` is nullable. `if (a.author)` is correct;
 *     `if (a.author !== null)` renders an empty byline row.
 *   - `category` is the SLUG (what `?category=` takes) while `source` is the
 *     display NAME (`?source=` takes the numeric id from `/api/sources/`).
 */

/** DRF `PageNumberPagination` envelope. */
export interface Paginated<T> {
  count: number
  /**
   * Absolute URL of the next page, or null. Points at the Django origin and
   * echoes back an unclamped `page_size` — use it as a boolean only, and derive
   * the next page number yourself. See `.CLAUDE/api-docs.md#pagination`.
   */
  next: string | null
  previous: string | null
  results: T[]
}

export interface Article {
  id: number
  title: string
  /** Publisher URL. The outbound handoff target. Present on 100% of rows. */
  url: string
  /** 1–3 sentences. There is no body text anywhere in this API. */
  description: string
  /** null on 100% of rows today. Progressive enhancement only. */
  ai_summary: string | null
  /** `""` about half the time. Not null — an empty string. */
  author: string
  /** `""` on 100% of rows. There is no image variant of the card. */
  image_url: string
  /** ISO 8601, e.g. "2026-07-27T13:59:02Z" */
  published_at: string
  /** ISO 8601 with microseconds. */
  collected_at: string
  /** Category SLUG — this is what `?category=` takes. */
  category: string
  /** Category display name. */
  category_name: string
  /** Source NAME string — NOT the id. */
  source: string
}

export interface Category {
  id: number
  name: string
  slug: string
  article_count: number
}

export interface NewsSource {
  id: number
  name: string
  /** `""` on all 14 rows. Do not render a link from this. */
  homepage_url: string
  is_active: boolean
}

/**
 * Kept as a union so an ordering can never be built by hand. An unrecognised
 * value is silently ignored by the API and returns the default order with a
 * 200 — a typo would produce no error and no visible symptom.
 */
export type Ordering =
  | 'published_at'
  | '-published_at'
  | 'collected_at'
  | '-collected_at'

export interface ArticleQuery {
  page?: number
  page_size?: number
  /** Category slug. */
  category?: string
  /** Source id. Single value only — the backend filter is a `NumberFilter`. */
  source?: number
  search?: string
  ordering?: Ordering
}

/** Everything that identifies a feed except its position within it. */
export type ArticleFeedQuery = Omit<ArticleQuery, 'page'>
