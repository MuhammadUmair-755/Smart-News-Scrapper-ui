import { useMemo } from 'react'

import type { Article } from '@/api/types'

/**
 * Groups articles into grid rows.
 *
 * The virtualizer measures and positions rows, not cells — a CSS grid would
 * otherwise place items itself and the two would disagree about where anything
 * is. Kept pure and separate so the chunking is unit-testable without a DOM.
 */
export function chunkIntoRows(articles: Article[], columns: number): Article[][] {
  const size = Math.max(1, columns)
  const rows: Article[][] = []

  for (let i = 0; i < articles.length; i += size) {
    rows.push(articles.slice(i, i + size))
  }

  return rows
}

export function useFeedRows(articles: Article[], columns: number): Article[][] {
  return useMemo(() => chunkIntoRows(articles, columns), [articles, columns])
}
