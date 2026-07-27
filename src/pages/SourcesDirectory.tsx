import { Radio, Search } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link } from 'react-router'

import { SourceMonogram } from '@/components/article/SourceMonogram'
import { EmptyState } from '@/components/state/EmptyState'
import { ErrorState } from '@/components/state/ErrorState'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Skeleton } from '@/components/ui/Skeleton'
import { useInfiniteArticles } from '@/hooks/useArticles'
import { useSources } from '@/hooks/useSources'
import { cn } from '@/lib/cn'
import { REFRESH_INTERVAL_MINUTES } from '@/lib/constants'
import { pluralise } from '@/lib/format'

/**
 * Provenance: which publishers feed the aggregator.
 *
 * The comps also show a per-source article count, a 7-day ingest sparkline, a
 * last-fetched time and the feed URL. None of those exist in the API —
 * `NewsSourceSerializer` carries no count, there is no ingest-stats endpoint,
 * and `homepage_url` is blank on all 14 rows. They are omitted rather than
 * faked; counting client-side would mean fetching every article.
 * See `.CLAUDE/context.md#known-backend-gaps`.
 */
export default function SourcesDirectory() {
  const { data: sources = [], isPending, isError, error, refetch } = useSources()
  const [filter, setFilter] = useState('')

  // Only for the aggregate stat; one page of one is enough to read `count`.
  const feed = useInfiniteArticles({ page_size: 1 })

  const visible = useMemo(() => {
    const needle = filter.trim().toLowerCase()
    if (!needle) return sources
    return sources.filter((source) => source.name.toLowerCase().includes(needle))
  }, [sources, filter])

  const activeCount = sources.filter((source) => source.is_active).length

  if (isError) {
    return (
      <div className="mx-auto w-full max-w-(--container-shell) px-4 py-16 sm:px-8">
        <ErrorState error={error} onRetry={() => void refetch()} />
      </div>
    )
  }

  return (
    <div className="mx-auto w-full max-w-(--container-shell) px-4 py-10 sm:px-8">
      <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <h1 className="font-headline text-headline-lg text-ink">Sources</h1>
          <p className="mt-1 text-body-md text-ink-muted">
            Every publisher in the pipeline. Each links through to its own feed.
          </p>
        </div>

        <div className="w-full md:w-[280px]">
          <Input
            type="search"
            aria-label="Filter sources by name"
            placeholder="Filter sources"
            value={filter}
            onChange={(event) => setFilter(event.target.value)}
            leading={<Search aria-hidden className="size-4" />}
          />
        </div>
      </div>

      <dl className="mb-12 grid grid-cols-2 gap-4 md:grid-cols-4">
        <Stat label="Publishers" value={isPending ? null : sources.length} />
        <Stat label="Stories" value={feed.isPending ? null : feed.total} />
        <Stat
          label="Refresh interval"
          value={REFRESH_INTERVAL_MINUTES}
          suffix="min"
        />
        <Stat
          label="Active"
          value={isPending ? null : activeCount}
          suffix={isPending ? undefined : `of ${sources.length}`}
        />
      </dl>

      {isPending ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }, (_, index) => (
            <Skeleton key={index} className="h-[168px] rounded-card" />
          ))}
        </div>
      ) : null}

      {!isPending && visible.length === 0 ? (
        <EmptyState
          icon={Radio}
          title={`No publishers match “${filter}”`}
          description="Try a shorter term — publisher names include their section, like “BBC News – World”."
          action={
            <Button variant="secondary" onClick={() => setFilter('')}>
              Clear filter
            </Button>
          }
        />
      ) : null}

      {visible.length > 0 ? (
        <ul className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {visible.map((source) => (
            <li key={source.id}>
              <div
                className={cn(
                  'group flex h-full flex-col rounded-card border border-hairline',
                  'bg-surface p-5 shadow-rest',
                  'transition-[box-shadow,border-color,transform] duration-(--duration-medium) ease-standard',
                  'hover:-translate-y-0.5 hover:border-border-strong hover:shadow-hover',
                )}
              >
                <div className="mb-4 flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <SourceMonogram name={source.name} size="lg" />
                    <h2 className="min-w-0 font-headline text-title-md text-ink">
                      {source.name}
                    </h2>
                  </div>

                  {/*
                    Status is a text chip, never a bare coloured dot — colour is
                    not allowed to be the only carrier of meaning.
                  */}
                  <span
                    className={cn(
                      'shrink-0 rounded-full px-2 py-0.5 text-label-sm uppercase',
                      source.is_active
                        ? 'bg-success-tint text-success'
                        : 'bg-warning-tint text-warning',
                    )}
                  >
                    {source.is_active ? 'Active' : 'Paused'}
                  </span>
                </div>

                <p className="mb-6 text-body-sm text-ink-secondary">
                  Collected every {REFRESH_INTERVAL_MINUTES} minutes into the
                  shared feed.
                </p>

                <Button asChild variant="secondary" size="sm" className="mt-auto">
                  <Link to={`/?source=${source.id}`}>
                    View stories
                    <span className="sr-only"> from {source.name}</span>
                  </Link>
                </Button>
              </div>
            </li>
          ))}
        </ul>
      ) : null}

      <p className="mt-10 text-body-sm text-ink-muted">
        {pluralise(sources.length, 'publisher', 'publishers')} feeding the
        aggregator.
      </p>
    </div>
  )
}

function Stat({
  label,
  value,
  suffix,
}: {
  label: string
  value: number | null
  // See the note in FilterRail: exactOptionalPropertyTypes distinguishes an
  // absent prop from one explicitly set to undefined, which is what the
  // pending-state call site passes.
  suffix?: string | undefined
}) {
  return (
    <div className="flex flex-col justify-center rounded-card border border-hairline bg-surface p-5">
      <dd className="font-headline text-headline-md text-ink">
        {value === null ? (
          <Skeleton className="h-7 w-16" />
        ) : (
          <>
            {value.toLocaleString()}
            {suffix ? (
              <span className="ml-1 text-body-md text-ink-muted">{suffix}</span>
            ) : null}
          </>
        )}
      </dd>
      <dt className="mt-1 text-label-sm text-ink-muted uppercase">{label}</dt>
    </div>
  )
}
