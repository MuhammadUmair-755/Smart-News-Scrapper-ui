import { RotateCw } from 'lucide-react'

import { useSources } from '@/hooks/useSources'
import { cn } from '@/lib/cn'
import { pluralise, relativeTimeLong } from '@/lib/format'

export interface FreshnessStripProps {
  total: number
  /** `dataUpdatedAt` from the feed query — when *we* last had fresh data. */
  updatedAt: number
  isFetching: boolean
  onRefresh: () => void
}

/**
 * Provenance line under the header: when the feed was last read and how much of
 * it there is.
 *
 * Deliberately not a background poller. Nothing here refetches on a timer, so
 * the reading position is never disturbed by stories arriving mid-scroll — the
 * user refreshes when they choose to.
 */
export function FreshnessStrip({
  total,
  updatedAt,
  isFetching,
  onRefresh,
}: FreshnessStripProps) {
  const { data: sources = [] } = useSources()

  return (
    <div className="border-b border-hairline bg-sunken">
      <div className="mx-auto flex h-10 w-full max-w-(--container-shell) items-center justify-between gap-4 px-4 sm:px-8">
        <p aria-live="polite" className="flex items-center gap-2 truncate text-body-sm text-ink-secondary">
          <span
            aria-hidden
            className={cn(
              'size-2 shrink-0 rounded-full bg-success',
              isFetching && 'animate-pulse',
            )}
          />
          <span className="truncate">
            Updated {updatedAt ? relativeTimeLong(new Date(updatedAt).toISOString()) : 'just now'}
            <span aria-hidden className="px-2">
              ·
            </span>
            {pluralise(total, 'story', 'stories')}
            {sources.length > 0 ? ` from ${sources.length} sources` : ''}
          </span>
        </p>

        <button
          type="button"
          onClick={onRefresh}
          disabled={isFetching}
          className={cn(
            'flex shrink-0 items-center gap-1.5 rounded-micro px-2 py-1 text-body-sm font-medium',
            'text-ink-secondary transition-colors duration-(--duration-micro)',
            'hover:bg-hairline/60 hover:text-ink disabled:opacity-50',
          )}
        >
          <RotateCw
            aria-hidden
            className={cn('size-4', isFetching && 'animate-spin')}
          />
          Refresh
        </button>
      </div>
    </div>
  )
}
