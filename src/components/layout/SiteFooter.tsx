import { Link } from 'react-router'

import { useCategories } from '@/hooks/useCategories'
import { REFRESH_INTERVAL_MINUTES } from '@/lib/constants'

export function SiteFooter() {
  const { data: categories = [] } = useCategories()

  return (
    <footer className="mt-auto w-full border-t border-hairline bg-sunken">
      <div className="mx-auto grid w-full max-w-(--container-shell) grid-cols-1 gap-8 px-4 py-12 sm:px-8 md:grid-cols-2 lg:grid-cols-4">
        <div className="flex flex-col gap-4 md:col-span-2 lg:col-span-1">
          <div className="flex items-center gap-2">
            <span aria-hidden className="size-4 rounded-micro bg-ink" />
            <span className="font-headline text-headline-sm font-bold text-ink">
              Aggregator
            </span>
          </div>
          <p className="text-body-sm text-ink-secondary">
            Headlines from 14 publishers, collected every{' '}
            {REFRESH_INTERVAL_MINUTES} minutes. Every story links back to its
            source.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <h2 className="text-label-sm text-ink uppercase">Categories</h2>
          {categories.map((category) => (
            <Link
              key={category.id}
              to={`/c/${category.slug}`}
              className="text-body-sm text-ink-muted transition-colors hover:text-ink-secondary"
            >
              {category.name}
            </Link>
          ))}
        </div>

        <div className="flex flex-col gap-3">
          <h2 className="text-label-sm text-ink uppercase">Sources</h2>
          <Link
            to="/sources"
            className="text-body-sm text-ink-muted transition-colors hover:text-ink-secondary"
          >
            View all publishers
          </Link>
        </div>

        <div className="flex flex-col gap-3">
          <h2 className="text-label-sm text-ink uppercase">Search</h2>
          <Link
            to="/search"
            className="text-body-sm text-ink-muted transition-colors hover:text-ink-secondary"
          >
            Search every headline
          </Link>
        </div>
      </div>
    </footer>
  )
}
