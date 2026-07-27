import { SkeletonGrid } from '@/components/state/SkeletonCard'
import { Skeleton } from '@/components/ui/Skeleton'

/**
 * What the router shows while the first route module is still downloading.
 *
 * A data router renders its `HydrateFallback` for the *whole* tree during
 * initial hydration, so without this the app is a blank page until the lazy
 * chunk lands — the shell cannot paint early on its own.
 */
export function AppSkeleton() {
  return (
    <div className="flex min-h-dvh flex-col">
      <div className="sticky top-0 z-40 border-b border-hairline bg-canvas/90">
        <div className="mx-auto flex h-16 w-full max-w-(--container-shell) items-center justify-between px-4 sm:px-8">
          <div className="flex items-center gap-3">
            <span aria-hidden className="size-5 rounded-micro bg-brand" />
            <span className="font-headline text-headline-md font-bold text-ink">
              Aggregator
            </span>
          </div>
          <Skeleton className="h-11 w-72 rounded-control" />
        </div>
      </div>

      <div className="mx-auto w-full max-w-(--container-shell) px-4 py-10 sm:px-8">
        <span className="sr-only" role="status">
          Loading
        </span>
        <div className="mb-10 space-y-4 border-b border-hairline pb-10">
          <Skeleton className="h-3 w-40" />
          <Skeleton className="h-10 w-[80%]" />
          <Skeleton className="h-4 w-[60%]" />
        </div>
        <SkeletonGrid />
      </div>
    </div>
  )
}
