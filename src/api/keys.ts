import type { ArticleFeedQuery } from './types'

/**
 * Query keys carry every parameter that affects the response. Leaving one out
 * means a filter change serves a stale cache.
 *
 * `articles` deliberately takes a feed query with no `page` — pagination lives
 * inside the infinite query, not in its key.
 */
export const keys = {
  articles: (query: ArticleFeedQuery) => ['articles', query] as const,
  /**
   * Deliberately a separate namespace from `articles`: the feed stores an
   * infinite-query `{ pages }` shape and the rails store a bare envelope, and
   * anything scanning the feed cache by prefix must not meet the other one.
   */
  related: (query: ArticleFeedQuery) => ['articles-related', query] as const,
  article: (id: number) => ['article', id] as const,
  categories: () => ['categories'] as const,
  sources: () => ['sources'] as const,
}
