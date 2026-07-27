import {
  useInfiniteQuery,
  useQuery,
  useQueryClient,
  type QueryClient,
} from '@tanstack/react-query'
import { useMemo } from 'react'

import { getArticle, getArticles } from '@/api/articles'
import { ApiError } from '@/api/client'
import { keys } from '@/api/keys'
import type { Article, ArticleFeedQuery, Paginated } from '@/api/types'
import { PAGE_SIZE } from '@/lib/constants'

export interface UseInfiniteArticlesOptions {
  /**
   * Held off until there is something to ask for. An empty `search` is dropped
   * by the client, so an unguarded search screen would fetch the entire feed
   * while the field is still empty.
   */
  enabled?: boolean
}

export function useInfiniteArticles(
  query: ArticleFeedQuery,
  options: UseInfiniteArticlesOptions = {},
) {
  const params: ArticleFeedQuery = { page_size: PAGE_SIZE, ...query }

  const result = useInfiniteQuery({
    enabled: options.enabled ?? true,
    queryKey: keys.articles(params),
    queryFn: ({ pageParam }) => getArticles({ ...params, page: pageParam }),
    initialPageParam: 1,
    /**
     * `next` is an absolute Django-origin URL that echoes back an unclamped
     * `page_size`, so it is only ever read as "is there more?". The page number
     * is derived here and re-issued through our own client.
     */
    getNextPageParam: (last: Paginated<Article>, all) =>
      last.next ? all.length + 1 : undefined,
    getPreviousPageParam: (first: Paginated<Article>, _all, firstParam) =>
      first.previous ? firstParam - 1 : undefined,
  })

  const articles = useMemo(
    () => result.data?.pages.flatMap((page) => page.results) ?? [],
    [result.data],
  )

  return {
    ...result,
    articles,
    /** Total across every page — not `articles.length`. */
    total: result.data?.pages[0]?.count ?? 0,
  }
}

/**
 * Reads an article the feed has already loaded. The list row and the detail
 * response are the identical serializer output, so this is exact data rather
 * than a partial placeholder — it lets the preview paint real content
 * immediately while the fetch revalidates behind it, which is what keeps the
 * card → preview view transition from morphing into a skeleton.
 */
function articleFromFeedCache(
  client: QueryClient,
  id: number,
): { article: Article; updatedAt: number } | undefined {
  const entries = client.getQueriesData<{ pages: Paginated<Article>[] }>({
    queryKey: ['articles'],
  })

  for (const [queryKey, data] of entries) {
    if (!Array.isArray(data?.pages)) continue

    const match = data.pages
      .flatMap((page) => page.results)
      .find((article) => article.id === id)

    if (match) {
      const state = client.getQueryState(queryKey)
      return { article: match, updatedAt: state?.dataUpdatedAt ?? 0 }
    }
  }

  return undefined
}

export function useArticle(id: number) {
  const client = useQueryClient()
  const seeded = articleFromFeedCache(client, id)

  return useQuery({
    queryKey: keys.article(id),
    queryFn: () => getArticle(id),
    // A missing article is a route-level not-found; retrying cannot fix it.
    retry: (failureCount, error) =>
      !(error instanceof ApiError && error.isClientError) && failureCount < 2,
    ...(seeded
      ? { initialData: seeded.article, initialDataUpdatedAt: seeded.updatedAt }
      : {}),
  })
}

/**
 * The rails at the foot of the preview. Small, capped, and deliberately not
 * infinite — they are context, not a second feed.
 */
export function useRelatedArticles(
  query: ArticleFeedQuery,
  excludeId: number,
  limit = 6,
) {
  const result = useQuery({
    queryKey: keys.related({ ...query, page_size: limit + 1 }),
    queryFn: () => getArticles({ ...query, page_size: limit + 1 }),
  })

  const articles = useMemo(
    () =>
      (result.data?.results ?? [])
        .filter((article) => article.id !== excludeId)
        .slice(0, limit),
    [result.data, excludeId, limit],
  )

  return { ...result, articles }
}
