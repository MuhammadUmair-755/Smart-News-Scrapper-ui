import { request } from './client'
import type { NewsSource } from './types'

/**
 * Unpaginated — a bare array of 14. Ids are 2–15; there is no id 1, so nothing
 * may assume contiguity or index by id.
 */
export function getSources(): Promise<NewsSource[]> {
  return request<NewsSource[]>('/sources/')
}
