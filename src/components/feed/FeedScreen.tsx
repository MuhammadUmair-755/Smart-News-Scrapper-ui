import { Newspaper } from 'lucide-react'
import { useState, type ReactNode } from 'react'
import { useSearchParams } from 'react-router'

import type { ArticleFeedQuery, Ordering } from '@/api/types'
import { ArticleList } from '@/components/article/ArticleList'
import { LeadStory } from '@/components/article/LeadStory'
import { FeedToolbar } from '@/components/feed/FeedToolbar'
import { FreshnessStrip } from '@/components/feed/FreshnessStrip'
import { LoadMore } from '@/components/feed/LoadMore'
import { FilterRail } from '@/components/layout/FilterRail'
import { EmptyState } from '@/components/state/EmptyState'
import { ErrorState } from '@/components/state/ErrorState'
import { SkeletonGrid } from '@/components/state/SkeletonCard'
import { Drawer } from '@/components/ui/Drawer'
import { useInfiniteArticles } from '@/hooks/useArticles'
import { useFeedScrollRestore } from '@/hooks/useFeedScrollRestore'
import { DEFAULT_ORDERING, ORDERING_OPTIONS } from '@/lib/constants'

export interface FeedScreenProps {
  /** Category slug when this is a category feed. Undefined on Home. */
  category?: string
  /** Rendered above the toolbar — the page's heading block. */
  heading?: ReactNode
  /** Promote the newest story to a full-width lead. Home only. */
  showLead?: boolean
  /** Copy for the empty case; differs per context. */
  emptyTitle: string
  emptyDescription: string
  emptyAction?: ReactNode
  /** Cache key suffix so each feed restores its own scroll position. */
  scrollKey: string
}

function parseOrdering(value: string | null): Ordering {
  const match = ORDERING_OPTIONS.find((option) => option.value === value)
  return match?.value ?? DEFAULT_ORDERING
}

/**
 * The shared feed body behind Home and the category feeds.
 *
 * All filter state lives in the URL, so every view is shareable, survives a
 * reload and moves the query key when it changes.
 */
export function FeedScreen({
  category,
  heading,
  showLead = false,
  emptyTitle,
  emptyDescription,
  emptyAction,
  scrollKey,
}: FeedScreenProps) {
  const [searchParams, setSearchParams] = useSearchParams()
  const [filtersOpen, setFiltersOpen] = useState(false)

  const ordering = parseOrdering(searchParams.get('sort'))
  const sourceParam = Number(searchParams.get('source'))
  const source = Number.isFinite(sourceParam) && sourceParam > 0 ? sourceParam : undefined

  const query: ArticleFeedQuery = {
    ...(category ? { category } : {}),
    ...(source ? { source } : {}),
    ordering,
  }

  const feed = useInfiniteArticles(query)

  const setParam = (key: string, value: string | undefined) => {
    setSearchParams(
      (previous) => {
        const next = new URLSearchParams(previous)
        if (value === undefined) next.delete(key)
        else next.set(key, value)
        return next
      },
      { replace: true },
    )
  }

  // Only restore once the cached pages are back in the DOM.
  useFeedScrollRestore(scrollKey, feed.articles.length > 0)

  // The lead story is pulled out of the virtualized rows and rendered above
  // them; the list's positions shift by one so the announced index still
  // matches the reading order.
  const lead = showLead ? feed.articles[0] : undefined
  const listArticles = lead ? feed.articles.slice(1) : feed.articles

  const rail = (
    <FilterRail
      {...(category ? { category } : {})}
      {...(source ? { source } : {})}
      onSourceChange={(next) => setParam('source', next ? String(next) : undefined)}
    />
  )

  return (
    <>
      <FreshnessStrip
        total={feed.total}
        updatedAt={feed.dataUpdatedAt}
        isFetching={feed.isFetching && !feed.isFetchingNextPage}
        onRefresh={() => void feed.refetch()}
      />

      <div className="mx-auto flex w-full max-w-(--container-shell) gap-8 px-4 py-10 sm:px-8">
        <aside
          aria-label="Filters"
          className="sticky top-24 hidden h-fit w-[260px] shrink-0 rounded-card bg-sunken p-5 lg:block"
        >
          {rail}
        </aside>

        <div className="min-w-0 flex-1">
          {heading}

          {lead ? (
            <div className="mb-10 border-b border-hairline pb-10">
              <LeadStory article={lead} />
            </div>
          ) : null}

          <FeedToolbar
            {...(category ? { category } : {})}
            ordering={ordering}
            onOrderingChange={(next) =>
              setParam('sort', next === DEFAULT_ORDERING ? undefined : next)
            }
            total={feed.total}
            onOpenFilters={() => setFiltersOpen(true)}
            activeFilterCount={source ? 1 : 0}
          />

          {feed.isError && feed.articles.length === 0 ? (
            <ErrorState error={feed.error} onRetry={() => void feed.refetch()} />
          ) : null}

          {/* An error with cached content still readable underneath. */}
          {feed.isError && feed.articles.length > 0 ? (
            <ErrorState
              variant="banner"
              error={feed.error}
              onRetry={() => void feed.refetch()}
              className="mb-6"
            />
          ) : null}

          {feed.isPending ? <SkeletonGrid /> : null}

          {!feed.isPending && !feed.isError && feed.total === 0 ? (
            <EmptyState
              icon={Newspaper}
              title={emptyTitle}
              description={emptyDescription}
              {...(emptyAction ? { action: emptyAction } : {})}
            />
          ) : null}

          {listArticles.length > 0 ? (
            <>
              <ArticleList
                articles={listArticles}
                total={feed.total}
                hasNextPage={feed.hasNextPage}
                isFetchingNextPage={feed.isFetchingNextPage}
                fetchNextPage={() => void feed.fetchNextPage()}
                animateEntrance={feed.data?.pages.length === 1}
                positionOffset={lead ? 1 : 0}
              />

              <LoadMore
                loaded={feed.articles.length}
                total={feed.total}
                hasNextPage={feed.hasNextPage}
                isFetchingNextPage={feed.isFetchingNextPage}
                onLoadMore={() => void feed.fetchNextPage()}
              />
            </>
          ) : null}
        </div>
      </div>

      <Drawer open={filtersOpen} onOpenChange={setFiltersOpen} title="Filters">
        {rail}
      </Drawer>
    </>
  )
}
