import { cn } from '@/lib/cn'

export interface SkeletonProps {
  className?: string
}

/**
 * A shimmering block, never a spinner. `base.css` neutralises the animation
 * under `prefers-reduced-motion`, leaving a flat placeholder.
 */
export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      aria-hidden
      className={cn(
        'animate-shimmer rounded-micro bg-sunken',
        'bg-[linear-gradient(90deg,var(--color-sunken)_0%,var(--color-canvas)_50%,var(--color-sunken)_100%)]',
        'bg-[length:200%_100%]',
        className,
      )}
    />
  )
}
