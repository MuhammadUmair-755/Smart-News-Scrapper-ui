import { Link, useParams } from 'react-router'

import { FeedScreen } from '@/components/feed/FeedScreen'
import NotFound from '@/pages/NotFound'
import { Button } from '@/components/ui/Button'
import { SkeletonGrid } from '@/components/state/SkeletonCard'
import { useCategories } from '@/hooks/useCategories'
import { cn } from '@/lib/cn'
import { categoryStyle } from '@/lib/constants'
import { pluralise } from '@/lib/format'

/**
 * The same feed body scoped to one category.
 *
 * The slug is validated against `/api/categories/` before it is trusted:
 * `/api/articles/?category=nope` returns 200 with an empty page, so an unknown
 * slug is indistinguishable from an empty category at the article endpoint.
 * A typo has to render a 404, not an empty feed.
 */
export default function CategoryFeed() {
  const { slug = '' } = useParams()
  const { data: categories, isPending } = useCategories()

  if (isPending) {
    return (
      <div className="mx-auto w-full max-w-(--container-shell) px-4 py-10 sm:px-8">
        <SkeletonGrid />
      </div>
    )
  }

  const category = categories?.find((item) => item.slug === slug)
  if (!category) return <NotFound />

  const style = categoryStyle(category.slug)

  return (
    <FeedScreen
      category={category.slug}
      scrollKey={`category-${category.slug}`}
      heading={
        <div className="mb-8">
          <h1
            className={cn(
              'font-headline text-headline-lg',
              'border-l-[3px] pl-4',
              style.rule,
              style.text,
            )}
          >
            {category.name}
          </h1>
          <p className="mt-2 pl-4 text-body-sm text-ink-muted">
            {pluralise(category.article_count, 'story', 'stories')} from the last
            collection run
          </p>
        </div>
      }
      emptyTitle={`No ${category.name} stories match these filters`}
      emptyDescription="Clearing the source filter will widen this feed back to every publisher."
      emptyAction={
        <Button asChild variant="secondary">
          <Link to={`/c/${category.slug}`}>Clear source filter</Link>
        </Button>
      }
    />
  )
}
