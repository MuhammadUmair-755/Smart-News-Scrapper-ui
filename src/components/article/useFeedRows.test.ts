/**
 * @vitest-environment node
 *
 * Chunking is pure — it is deliberately separate from the virtualizer so it can
 * be tested without a DOM.
 */
import { describe, expect, it } from 'vitest'

import type { Article } from '@/api/types'

import { chunkIntoRows } from './useFeedRows'

function article(id: number): Article {
  return {
    id,
    title: `Story ${id}`,
    url: 'https://example.com/story',
    description: 'A description.',
    ai_summary: null,
    author: '',
    image_url: '',
    published_at: '2026-07-27T12:00:00Z',
    collected_at: '2026-07-27T12:00:00Z',
    category: 'tech',
    category_name: 'Tech',
    source: 'The Verge',
  }
}

const articles = Array.from({ length: 7 }, (_, index) => article(index + 1))

describe('chunkIntoRows', () => {
  it('fills rows left to right at each column count', () => {
    expect(chunkIntoRows(articles, 3).map((row) => row.length)).toEqual([3, 3, 1])
    expect(chunkIntoRows(articles, 2).map((row) => row.length)).toEqual([2, 2, 2, 1])
    expect(chunkIntoRows(articles, 1)).toHaveLength(7)
  })

  it('preserves order across the flattened rows', () => {
    const flat = chunkIntoRows(articles, 3).flat()
    expect(flat.map((item) => item.id)).toEqual([1, 2, 3, 4, 5, 6, 7])
  })

  it('returns no rows for an empty feed', () => {
    expect(chunkIntoRows([], 3)).toEqual([])
  })

  it('never produces a zero-width row', () => {
    // A column count of 0 would loop forever without the guard.
    expect(chunkIntoRows(articles, 0)).toHaveLength(7)
  })
})
