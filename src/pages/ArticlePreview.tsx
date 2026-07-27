import { ArrowUpRight, Check, ChevronLeft, Link2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router'

import { ApiError } from '@/api/client'
import { ArticleMeta } from '@/components/article/ArticleMeta'
import { SourceMonogram } from '@/components/article/SourceMonogram'
import { ErrorState } from '@/components/state/ErrorState'
import { Button } from '@/components/ui/Button'
import { Skeleton } from '@/components/ui/Skeleton'
import { useArticle, useRelatedArticles } from '@/hooks/useArticles'
import { cn } from '@/lib/cn'
import { categoryStyle } from '@/lib/constants'
import { absoluteTime, displayUrl, relativeTimeLong } from '@/lib/format'
import NotFound from '@/pages/NotFound'

/**
 * A preview that ends in an outbound handoff — not a reader.
 *
 * The API has no body text: only a title and a one-to-three sentence
 * description. Building a reading view here would be building a screen with
 * nothing to put in it, so the emphasis is the handoff panel and the screen is
 * designed to feel complete at that length.
 */
export default function ArticlePreview() {
  const { id = '' } = useParams()
  const articleId = Number(id)
  const { data: article, isPending, isError, error, refetch } = useArticle(articleId)

  if (!Number.isInteger(articleId) || articleId <= 0) return <NotFound />
  // A missing article is a route-level not-found, never an error banner.
  if (isError && error instanceof ApiError && error.status === 404) {
    return <NotFound />
  }

  if (isError) {
    return (
      <div className="mx-auto w-full max-w-[820px] px-4 py-16 sm:px-8">
        <ErrorState error={error} onRetry={() => void refetch()} />
      </div>
    )
  }

  if (isPending || !article) return <PreviewSkeleton />

  const style = categoryStyle(article.category)

  return (
    <article className="mx-auto w-full max-w-[820px] px-4 pt-6 pb-16 sm:px-8">
      <nav aria-label="Breadcrumb" className="mb-8">
        <Link
          to={`/c/${article.category}`}
          className="inline-flex items-center gap-1 text-body-sm text-ink-secondary transition-colors hover:text-ink"
        >
          <ChevronLeft aria-hidden className="size-4" />
          {article.category_name}
        </Link>
      </nav>

      <ArticleMeta
        categorySlug={article.category}
        categoryName={article.category_name}
        source={article.source}
        publishedAt={article.published_at}
        className="mb-4"
      />

      <h1
        className="font-headline text-display-md text-ink"
        style={{ viewTransitionName: `article-${article.id}` }}
      >
        {article.title}
      </h1>

      <div className="mt-6 flex flex-wrap items-center gap-3 border-b border-hairline pb-6">
        <SourceMonogram
          name={article.source}
          category={article.category}
          size="md"
        />
        <span className="text-body-sm font-semibold text-ink">
          {article.author || article.source}
        </span>
        <span aria-hidden className="text-ink-muted">
          ·
        </span>
        <time
          dateTime={article.published_at}
          title={absoluteTime(article.published_at)}
          className="text-body-sm text-ink-muted"
        >
          {relativeTimeLong(article.published_at)}
        </time>
      </div>

      {/*
        `ai_summary` is null on every row today. The block only exists when
        there is one, and its absence changes no layout.
      */}
      {article.ai_summary ? (
        <section
          aria-label="AI summary"
          className="mt-8 rounded-card border border-brand/20 bg-brand-tint p-5"
        >
          <h2 className="mb-2 text-label-sm text-brand uppercase">AI summary</h2>
          <p className="text-body-md text-ink">{article.ai_summary}</p>
          <p className="mt-3 text-body-sm text-ink-muted">
            Generated from the publisher&rsquo;s description · may contain errors
          </p>
        </section>
      ) : null}

      <p className="mt-8 max-w-(--container-measure) text-body-lg text-ink-secondary">
        {article.description}
      </p>

      <HandoffPanel
        url={article.url}
        source={article.source}
        category={article.category}
        accentRule={style.rule}
      />

      <RelatedRails
        articleId={article.id}
        source={article.source}
        category={article.category}
        categoryName={article.category_name}
      />
    </article>
  )
}

function HandoffPanel({
  url,
  source,
  category,
  accentRule,
}: {
  url: string
  source: string
  category: string
  accentRule: string
}) {
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!copied) return
    const timer = window.setTimeout(() => setCopied(false), 2000)
    return () => window.clearTimeout(timer)
  }, [copied])

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
    } catch {
      // Clipboard denied or unavailable — the destination is printed below
      // anyway, so there is nothing to recover from.
    }
  }

  return (
    <section
      aria-label="Continue to the publisher"
      className={cn(
        'mt-10 rounded-card border border-hairline border-l-[3px] bg-surface p-5 shadow-rest',
        accentRule,
      )}
    >
      <div className="mb-5 flex items-start gap-3">
        <SourceMonogram name={source} category={category} size="lg" />
        <div className="min-w-0">
          <p className="text-body-sm font-semibold text-ink">
            This is a preview. Read the full story at {source}.
          </p>
          {/* The destination, so the user knows where they are going first. */}
          <p className="mt-1 truncate font-mono text-[11px] text-ink-muted">
            {displayUrl(url)}
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button asChild className="flex-1">
          <a href={url} target="_blank" rel="noopener noreferrer">
            Continue to {source}
            <ArrowUpRight aria-hidden className="size-4" />
            <span className="sr-only">, opens in a new tab</span>
          </a>
        </Button>

        <Button variant="secondary" onClick={() => void copy()}>
          {copied ? (
            <>
              <Check aria-hidden className="size-4 text-success" />
              Link copied
            </>
          ) : (
            <>
              <Link2 aria-hidden className="size-4" />
              Copy link
            </>
          )}
        </Button>
      </div>

      <p aria-live="polite" className="sr-only">
        {copied ? 'Link copied to clipboard' : ''}
      </p>
    </section>
  )
}

function RelatedRails({
  articleId,
  source,
  category,
  categoryName,
}: {
  articleId: number
  source: string
  category: string
  categoryName: string
}) {
  const related = useRelatedArticles({ category }, articleId, 6)

  if (related.articles.length === 0) return null

  return (
    <section aria-label={`More in ${categoryName}`} className="mt-14">
      <h2 className="mb-4 text-label-sm text-ink-secondary uppercase">
        More in {categoryName}
      </h2>

      <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {related.articles.map((item) => {
          const style = categoryStyle(item.category)

          return (
            <li key={item.id}>
              <Link
                to={`/a/${item.id}`}
                viewTransition
                className={cn(
                  'flex h-full flex-col gap-2 rounded-card border border-hairline border-l-[3px]',
                  'bg-surface p-4 shadow-rest',
                  'transition-[box-shadow,border-color] duration-(--duration-medium)',
                  'hover:border-border-strong hover:shadow-hover',
                  style.rule,
                )}
              >
                <span className="text-label-sm text-ink-muted uppercase">
                  {item.source}
                </span>
                <span className="line-clamp-3 font-headline text-title-md text-ink">
                  {item.title}
                </span>
              </Link>
            </li>
          )
        })}
      </ul>

      <p className="mt-4 text-body-sm text-ink-muted">
        Every story here comes from one of the 14 publishers in the pipeline,
        including {source}.
      </p>
    </section>
  )
}

function PreviewSkeleton() {
  return (
    <div className="mx-auto w-full max-w-[820px] px-4 pt-6 pb-16 sm:px-8">
      <Skeleton className="mb-8 h-4 w-24" />
      <Skeleton className="mb-4 h-3 w-56" />
      <div className="space-y-3">
        <Skeleton className="h-9 w-full" />
        <Skeleton className="h-9 w-[80%]" />
      </div>
      <Skeleton className="mt-8 h-10 w-48" />
      <div className="mt-8 space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-[60%]" />
      </div>
      <Skeleton className="mt-10 h-40 w-full rounded-card" />
    </div>
  )
}
