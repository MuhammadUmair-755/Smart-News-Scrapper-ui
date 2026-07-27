import { useQuery } from '@tanstack/react-query'

import { keys } from '@/api/keys'
import { getSources } from '@/api/sources'
import type { NewsSource } from '@/api/types'

/**
 * All 14 publishers, alphabetical. `is_active` is true on every row today, but
 * the directory filters on it anyway rather than assuming.
 */
export function useSources() {
  return useQuery({
    queryKey: keys.sources(),
    queryFn: getSources,
    staleTime: Infinity,
    select: (sources: NewsSource[]) =>
      [...sources].sort((a, b) => a.name.localeCompare(b.name)),
  })
}
