import { Button } from '@/components/ui/Button'
import { pluralise } from '@/lib/format'

export interface LoadMoreProps {
  loaded: number
  total: number
  hasNextPage: boolean
  isFetchingNextPage: boolean
  onLoadMore: () => void
}

/**
 * The accessible fallback for infinite scroll, and the progress readout.
 *
 * Infinite scroll is driven by the virtualizer's position, which a keyboard-only
 * user never triggers — tabbing through cards does not scroll the way a mouse
 * wheel does. This button is that user's path to the next page, so it is not
 * decorative.
 */
export function LoadMore({
  loaded,
  total,
  hasNextPage,
  isFetchingNextPage,
  onLoadMore,
}: LoadMoreProps) {
  const percent = total > 0 ? Math.min(100, (loaded / total) * 100) : 0

  return (
    <div className="flex flex-col items-center gap-4 pt-8 pb-12">
      <div
        role="progressbar"
        aria-valuenow={loaded}
        aria-valuemin={0}
        aria-valuemax={total}
        aria-label="Stories loaded"
        className="h-1 w-full max-w-md overflow-hidden rounded-full bg-sunken"
      >
        <div
          className="h-full bg-brand transition-[width] duration-(--duration-slow) ease-standard"
          style={{ width: `${percent}%` }}
        />
      </div>

      {/*
        Polite live region: announces each new page for anyone who cannot see
        the list grow.
      */}
      <p aria-live="polite" className="text-body-sm font-medium text-ink-secondary">
        Showing {loaded.toLocaleString()} of {pluralise(total, 'story', 'stories')}
      </p>

      {hasNextPage ? (
        <Button
          variant="secondary"
          onClick={onLoadMore}
          loading={isFetchingNextPage}
        >
          Load more stories
        </Button>
      ) : (
        <p className="text-body-sm text-ink-muted">
          You&rsquo;re all caught up.
        </p>
      )}
    </div>
  )
}
