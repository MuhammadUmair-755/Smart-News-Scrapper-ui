import { cn } from '@/lib/cn'
import { categoryStyle } from '@/lib/constants'
import { absoluteTime, relativeTime } from '@/lib/format'

export interface ArticleMetaProps {
  categorySlug: string
  categoryName: string
  source: string
  publishedAt: string
  className?: string
}

/**
 * The eyebrow row: category · source · age. 11px uppercase with middot
 * separators. The category is the only thing carrying accent colour, and it is
 * always readable as text so colour is never the sole signal.
 */
export function ArticleMeta({
  categorySlug,
  categoryName,
  source,
  publishedAt,
  className,
}: ArticleMetaProps) {
  const style = categoryStyle(categorySlug)

  return (
    <div
      className={cn(
        'flex items-center text-label-sm text-ink-muted uppercase',
        className,
      )}
    >
      <span className={cn('shrink-0', style.text)}>{categoryName}</span>
      <span aria-hidden className="px-2">
        ·
      </span>
      {/*
        Truncates rather than wrapping. Several publishers carry their section
        in the name — "The Guardian – Sport" — which pushes this row to three
        lines in a 3-up column and drags the headline down with it.
      */}
      <span className="min-w-0 truncate" title={source}>
        {source}
      </span>
      <span aria-hidden className="px-2">
        ·
      </span>
      <time
        dateTime={publishedAt}
        title={absoluteTime(publishedAt)}
        className="shrink-0"
      >
        {relativeTime(publishedAt)}
      </time>
    </div>
  )
}
