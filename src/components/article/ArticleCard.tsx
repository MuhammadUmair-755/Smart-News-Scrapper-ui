import { ArrowUpRight } from 'lucide-react'
import { Link, useViewTransitionState } from 'react-router'

import type { Article } from '@/api/types'
import { ArticleMeta } from '@/components/article/ArticleMeta'
import { SourceMonogram } from '@/components/article/SourceMonogram'
import { cn } from '@/lib/cn'
import { categoryStyle } from '@/lib/constants'

export interface ArticleCardProps {
  article: Article
  /** 1-based position, announced by screen readers under virtualization. */
  position?: number
  /** Total across every page, not the number currently in the DOM. */
  setSize?: number
}

/**
 * The text-only article card. There is no image variant: `image_url` is empty
 * on every row in the dataset, so a card without a picture is not a degraded
 * card, it is the card.
 *
 * Clicking anywhere opens the in-app preview. The outbound jump to the
 * publisher is a separate, explicit action — the small arrow button, which sits
 * above the link overlay so it stays independently clickable.
 */
export function ArticleCard({ article, position, setSize }: ArticleCardProps) {
  const style = categoryStyle(article.category)
  const to = `/a/${article.id}`
  const isTransitioning = useViewTransitionState(to)

  return (
    <article
      role="article"
      {...(position ? { 'aria-posinset': position } : {})}
      {...(setSize ? { 'aria-setsize': setSize } : {})}
      className={cn(
        'group relative flex flex-col rounded-card border border-hairline border-l-[3px]',
        'bg-surface p-5 shadow-rest',
        style.rule,
        'transition-[box-shadow,border-color,transform] duration-(--duration-medium) ease-standard',
        'hover:-translate-y-0.5 hover:border-border-strong hover:shadow-hover',
        // The link overlay covers the card, so the ring has to come from here.
        'focus-within:ring-2 focus-within:ring-brand focus-within:ring-offset-2',
      )}
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
        className="mb-3"
      />

      <h2 className="mb-2 font-headline text-headline-sm text-ink">
        <Link
          to={to}
          viewTransition
          className={cn(
            'line-clamp-3 outline-none',
            'transition-colors duration-(--duration-micro) ease-standard',
            'group-hover:text-brand',
            // Expands the hit area to the whole card without nesting the
            // outbound action inside this link.
            'after:absolute after:inset-0 after:content-[""]',
          )}
        >
          {article.title}
        </Link>
      </h2>

      {/*
        No `flex-grow` here. Letting the description stretch is what left the
        hollow void between text and footer in the first Stitch render; the gap
        is capped instead.
      */}
      <p className="line-clamp-2 text-body-sm text-ink-secondary">
        {article.description}
      </p>

      <div className="mt-6 flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <SourceMonogram
            name={article.source}
            category={article.category}
            size="sm"
          />
          {article.author ? (
            <span className="truncate text-body-sm text-ink-muted">
              {article.author}
            </span>
          ) : null}
        </div>

        <a
          href={article.url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(event) => event.stopPropagation()}
          className={cn(
            'relative z-10 flex size-8 items-center justify-center rounded-micro',
            'text-ink-muted opacity-0 transition-[opacity,color,background-color]',
            'duration-(--duration-fast) ease-standard',
            'hover:bg-brand-tint hover:text-brand',
            'focus-visible:opacity-100 group-hover:opacity-100',
          )}
        >
          <ArrowUpRight aria-hidden className="size-4" />
          <span className="sr-only">
            Read &ldquo;{article.title}&rdquo; at {article.source}, opens in a new
            tab
          </span>
        </a>
      </div>
    </article>
  )
}
