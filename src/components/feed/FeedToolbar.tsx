import { SlidersHorizontal } from 'lucide-react'

import type { Ordering } from '@/api/types'
import { Pill } from '@/components/ui/Pill'
import { SortMenu } from '@/components/ui/SortMenu'
import { useCategories } from '@/hooks/useCategories'
import { cn } from '@/lib/cn'

export interface FeedToolbarProps {
  /** Active category slug, or undefined for "All". */
  category?: string
  ordering: Ordering
  onOrderingChange: (ordering: Ordering) => void
  /** Total for the "All" pill. */
  total: number
  /** Opens the filter drawer. Omitted on screens without a rail. */
  onOpenFilters?: () => void
  /** Shown on the filter button when a source filter is applied. */
  activeFilterCount?: number
}

/**
 * The category pills and sort control, stuck under the header while the feed
 * scrolls beneath them.
 */
export function FeedToolbar({
  category,
  ordering,
  onOrderingChange,
  total,
  onOpenFilters,
  activeFilterCount = 0,
}: FeedToolbarProps) {
  const { data: categories = [] } = useCategories()

  return (
    <div
      className={cn(
        'sticky top-16 z-30 -mx-4 mb-6 flex flex-col gap-4 border-b border-hairline',
        'bg-canvas/95 px-4 py-4 backdrop-blur sm:mx-0 sm:px-0',
        'sm:flex-row sm:items-center sm:justify-between',
      )}
    >
      {/* Horizontally scrollable on mobile rather than wrapping into rows. */}
      <div className="-mx-4 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:px-0">
        <Pill to="/" selected={category === undefined} count={total}>
          All
        </Pill>

        {categories.map((item) => (
          <Pill
            key={item.id}
            to={`/c/${item.slug}`}
            accent={item.slug}
            selected={category === item.slug}
            count={item.article_count}
          >
            {item.name}
          </Pill>
        ))}
      </div>

      <div className="flex shrink-0 items-center gap-2">
        {onOpenFilters ? (
          <button
            type="button"
            onClick={onOpenFilters}
            className={cn(
              'inline-flex h-9 items-center gap-2 rounded-control px-3 lg:hidden',
              'border border-border-interactive bg-surface text-label-md text-ink',
              'transition-colors duration-(--duration-fast) hover:bg-sunken',
            )}
          >
            <SlidersHorizontal aria-hidden className="size-4" />
            Filters
            {activeFilterCount > 0 ? (
              <span className="flex size-5 items-center justify-center rounded-full bg-brand text-[11px] font-bold text-white">
                {activeFilterCount}
              </span>
            ) : null}
          </button>
        ) : null}

        <SortMenu value={ordering} onChange={onOrderingChange} />
      </div>
    </div>
  )
}
