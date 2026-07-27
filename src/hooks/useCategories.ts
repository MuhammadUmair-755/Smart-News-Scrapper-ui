import { useQuery } from '@tanstack/react-query'

import { getCategories } from '@/api/categories'
import { keys } from '@/api/keys'
import type { Category } from '@/api/types'

/**
 * Effectively static within a session, so it holds indefinitely. The response
 * is an unsorted bare array — sorted here by article count, descending, which
 * is the order the nav reads best in.
 */
export function useCategories() {
  return useQuery({
    queryKey: keys.categories(),
    queryFn: getCategories,
    staleTime: Infinity,
    select: (categories: Category[]) =>
      [...categories].sort((a, b) => b.article_count - a.article_count),
  })
}
