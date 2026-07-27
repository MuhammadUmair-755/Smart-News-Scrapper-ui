import { ArrowUpRight } from 'lucide-react'
import { Link, useViewTransitionState } from 'react-router'

import type { Article } from '@/api/types'
import { ArticleMeta } from '@/components/article/ArticleMeta'
import { SourceMonogram } from '@/components/article/SourceMonogram'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/cn'

export interface LeadStoryProps {
  article: Article
}

/**
 * The focal point of the feed's first screen — one story at display size,
 * full width and type-driven. Everything below it is scannable at equal weight.
 *
 * It is excluded from the virtualized rows: it sits above the list, and its
 * height is accounted for by the virtualizer's `scrollMargin`.
 */
export function LeadStory({ article }: LeadStoryProps) {
  const to = `/a/${article.id}`
  const isTransitioning = useViewTransitionState(to)

  return (
    <article
      className="group relative flex flex-col gap-6"
      style={
        isTransitioning
          ? { viewTransitionName: `article-${article.id}` }
          : undefined
      }
    >
      <ArticleMeta
        categorySlug={article.category}
        categoryName={article.category_name}
        source={article.source}
        publishedAt={article.published_at}
      />

      <h2 className="font-headline text-display-md text-ink">
        <Link
          to={to}
          viewTransition
          className={cn(
            'outline-none transition-colors duration-(--duration-medium) ease-standard',
            'group-hover:text-brand',
            'after:absolute after:inset-0 after:content-[""]',
          )}
        >
          {article.title}
        </Link>
      </h2>

      <p className="max-w-(--container-measure) text-body-lg text-ink-secondary">
        {article.description}
      </p>

      <div className="flex flex-wrap items-center justify-between gap-4 border-t border-hairline pt-6">
        <div className="flex min-w-0 items-center gap-3">
          <SourceMonogram
            name={article.source}
            category={article.category}
            size="md"
          />
          <span className="truncate text-body-sm font-medium text-ink">
            {article.author || article.source}
          </span>
        </div>

        <Button asChild className="relative z-10" size="sm">
          <a href={article.url} target="_blank" rel="noopener noreferrer">
            Read at {article.source}
            <ArrowUpRight aria-hidden className="size-4" />
            <span className="sr-only">, opens in a new tab</span>
          </a>
        </Button>
      </div>
    </article>
  )
}
