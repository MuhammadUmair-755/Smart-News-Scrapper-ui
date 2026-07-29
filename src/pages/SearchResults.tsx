import { Search, SearchX } from 'lucide-react'
import { useDeferredValue, useEffect, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router'

import type { ArticleFeedQuery } from '@/api/types'
import { SearchResultRow } from '@/components/article/SearchResultRow'
import { LoadMore } from '@/components/feed/LoadMore'
import { EmptyState } from '@/components/state/EmptyState'
import { ErrorState } from '@/components/state/ErrorState'
import { SkeletonCard } from '@/components/state/SkeletonCard'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Pill } from '@/components/ui/Pill'
import { useInfiniteArticles } from '@/hooks/useArticles'
import { useCategories } from '@/hooks/useCategories'
import { useDebounce } from '@/hooks/useDebounce'
import { pluralise } from '@/lib/format'

/**
 * Keyword search across title and description.
 *
 * The query lives in `?q=` so results are shareable and back/forward work.
 * Input is debounced by 300ms and the result list renders from a deferred
 * value, so typing never blocks on re-rendering a long list.
 */
export default function SearchResults() {
  const [searchParams, setSearchParams] = useSearchParams()
  const { data: categories = [] } = useCategories()

  const urlQuery = searchParams.get('q') ?? ''
  const categorySlug = searchParams.get('category') ?? undefined
  const [draft, setDraft] = useState(urlQuery)
  const debounced = useDebounce(draft, 300)


  const settled = useRef(urlQuery)

  // Back/forward and in-app links have to move the field, not just the results.
  useEffect(() => {
    if (urlQuery === settled.current) return
    settled.current = urlQuery
    setDraft(urlQuery)
  }, [urlQuery])

  // Typing wins, but only once it has stopped. Keyed on `debounced` alone —
  // waking this effect on `urlQuery` is what let a stale keystroke overwrite a
  // navigation that had already happened.
  useEffect(() => {
    if (debounced === settled.current) return
    settled.current = debounced

    setSearchParams(
      (previous) => {
        const next = new URLSearchParams(previous)
        if (debounced) next.set('q', debounced)
        else next.delete('q')
        return next
      },
      { replace: true },
    )
  }, [debounced, setSearchParams])

  const term = useDeferredValue(urlQuery)
  const hasQuery = term.trim().length > 0

  const query: ArticleFeedQuery = {
    search: term,
    ...(categorySlug ? { category: categorySlug } : {}),
  }

  // An empty query would return the whole unfiltered feed, which is not a
  // search result — the idle state is shown instead and nothing is fetched.
  const enabled = hasQuery
  const feed = useInfiniteArticles(query, { enabled })

  const scopeHref = (slug?: string) => {
    const next = new URLSearchParams(searchParams)
    if (slug) next.set('category', slug)
    else next.delete('category')
    return `/search?${next.toString()}`
  }

  return (
    <div className="mx-auto w-full max-w-[820px] px-4 py-10 sm:px-8">
      <h1 className="mb-6 font-headline text-headline-lg text-ink">Search</h1>

      <form role="search" onSubmit={(event) => event.preventDefault()}>
        <Input
          autoFocus
          type="search"
          name="q"
          aria-label="Search stories"
          placeholder="Search every headline and description…"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          leading={<Search aria-hidden className="size-5" />}
          className="h-12 text-body-md"
        />
      </form>

      {hasQuery ? (
        <div className="mt-6 -mx-4 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:px-0">
          <Pill to={scopeHref()} selected={categorySlug === undefined}>
            All
          </Pill>
          {categories.map((category) => (
            <Pill
              key={category.id}
              to={scopeHref(category.slug)}
              accent={category.slug}
              selected={categorySlug === category.slug}
            >
              {category.name}
            </Pill>
          ))}
        </div>
      ) : null}

      {!enabled ? (
        <EmptyState
          className="mt-10"
          icon={Search}
          title="Search the feed"
          description="Type a word or phrase to search every headline and description across all 14 publishers."
        />
      ) : null}

      {enabled ? (
        <>
          <p
            aria-live="polite"
            className="mt-6 mb-2 text-body-sm text-ink-secondary"
          >
            {feed.isPending
              ? 'Searching…'
              : `${pluralise(feed.total, 'result', 'results')} for “${term}”`}
          </p>

          {feed.isError ? (
            <ErrorState error={feed.error} onRetry={() => void feed.refetch()} />
          ) : null}

          {feed.isPending ? (
            <div className="flex flex-col gap-4">
              {Array.from({ length: 5 }, (_, index) => (
                <SkeletonCard key={index} />
              ))}
            </div>
          ) : null}

          {!feed.isPending && !feed.isError && feed.total === 0 ? (
            <EmptyState
              className="mt-6"
              icon={SearchX}
              title={`No stories match “${term}”`}
              description="Check the spelling, try a broader term, or widen the category scope."
              action={
                <Button asChild variant="secondary">
                  <Link to="/search">Clear search</Link>
                </Button>
              }
            />
          ) : null}

          {feed.articles.length > 0 ? (
            <>
              <div role="feed" aria-busy={feed.isFetchingNextPage} aria-label="Search results">
                {feed.articles.map((article, index) => (
                  <SearchResultRow
                    key={article.id}
                    article={article}
                    term={term}
                    position={index + 1}
                    setSize={feed.total}
                  />
                ))}
              </div>

              <LoadMore
                loaded={feed.articles.length}
                total={feed.total}
                hasNextPage={feed.hasNextPage}
                isFetchingNextPage={feed.isFetchingNextPage}
                onLoadMore={() => void feed.fetchNextPage()}
              />
            </>
          ) : null}
        </>
      ) : null}
    </div>
  )
}
