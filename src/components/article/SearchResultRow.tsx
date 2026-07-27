import { Link, useViewTransitionState } from 'react-router'

import type { Article } from '@/api/types'
import { ArticleMeta } from '@/components/article/ArticleMeta'
import { SourceMonogram } from '@/components/article/SourceMonogram'
import { cn } from '@/lib/cn'

export interface SearchResultRowProps {
  article: Article
  /** The term to mark up within the title and description. */
  term: string
  position?: number
  setSize?: number
}

/**
 * Splits text around every case-insensitive occurrence of `term`. Returns plain
 * text unchanged when there is no match, so a term that only hit the other
 * field does not produce a stray wrapper.
 */
function highlight(text: string, term: string) {
  const trimmed = term.trim()
  if (!trimmed) return text

  // Escape everything that would otherwise be regex syntax.
  const pattern = new RegExp(
    `(${trimmed.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`,
    'gi',
  )

  // `split` with a capture group puts the matches at every odd index. Testing
  // the regex again here would be wrong — a global regex carries `lastIndex`
  // between calls and would skip alternate matches.
  return text.split(pattern).map((part, index) =>
    index % 2 === 1 ? (
      // <mark> rather than a background class: the highlight has to survive
      // without colour.
      <mark key={index} className="rounded-[2px] bg-warning-tint text-ink">
        {part}
      </mark>
    ) : (
      part
    ),
  )
}

/**
 * A denser row than the feed card — search is about scanning many candidates
 * against a term, not browsing.
 */
export function SearchResultRow({
  article,
  term,
  position,
  setSize,
}: SearchResultRowProps) {
  const to = `/a/${article.id}`
  const isTransitioning = useViewTransitionState(to)

  return (
    <article
      role="article"
      {...(position ? { 'aria-posinset': position } : {})}
      {...(setSize ? { 'aria-setsize': setSize } : {})}
      className={cn(
        'group relative flex flex-col gap-2 border-b border-hairline px-1 py-5',
        'transition-colors duration-(--duration-micro) ease-standard',
        'hover:bg-surface',
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
      />

      <h3 className="font-headline text-headline-sm text-ink">
        <Link
          to={to}
          viewTransition
          className={cn(
            'line-clamp-3 outline-none transition-colors duration-(--duration-micro)',
            'group-hover:text-brand',
            'after:absolute after:inset-0 after:content-[""]',
          )}
        >
          {highlight(article.title, term)}
        </Link>
      </h3>

      <p className="line-clamp-2 text-body-sm text-ink-secondary">
        {highlight(article.description, term)}
      </p>

      <div className="flex items-center gap-2 pt-1">
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
    </article>
  )
}
