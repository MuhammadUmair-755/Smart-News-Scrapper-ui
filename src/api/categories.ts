import { request } from './client'
import type { Category } from './types'

/**
 * Unpaginated — a bare array, not an envelope. The array is not sorted, and
 * this endpoint is the only way to tell a real category slug from a typo:
 * `/api/articles/?category=nope` returns 200 with `count: 0`.
 */
export function getCategories(): Promise<Category[]> {
  return request<Category[]>('/categories/')
}
