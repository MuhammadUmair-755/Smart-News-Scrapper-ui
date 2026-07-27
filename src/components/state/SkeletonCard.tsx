import { Skeleton } from '@/components/ui/Skeleton'
import { cn } from '@/lib/cn'

export interface SkeletonCardProps {
  className?: string
}

/**
 * Mirrors `ArticleCard`'s real geometry — same padding, same left rule, same
 * three-line headline block — so the crossfade to content shifts nothing.
 */
export function SkeletonCard({ className }: SkeletonCardProps) {
  return (
    <div
      className={cn(
        'flex h-full flex-col rounded-card border border-hairline border-l-[3px]',
        'border-l-border-strong bg-surface p-5 shadow-rest',
        className,
      )}
    >
      <Skeleton className="mb-3 h-3 w-32" />

      <div className="mb-2 space-y-2">
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-5 w-[85%]" />
      </div>

      <div className="space-y-2">
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-[70%]" />
      </div>

      <div className="mt-6 flex items-center gap-2">
        <Skeleton className="size-6 rounded-micro" />
        <Skeleton className="h-3 w-24" />
      </div>
    </div>
  )
}

export interface SkeletonGridProps {
  count?: number
  columns?: number
}

/** The first-load state for a feed. Never a spinner. */
export function SkeletonGrid({ count = 6 }: SkeletonGridProps) {
  return (
    <div
      aria-hidden
      className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
    >
      {Array.from({ length: count }, (_, index) => (
        <SkeletonCard key={index} />
      ))}
    </div>
  )
}
