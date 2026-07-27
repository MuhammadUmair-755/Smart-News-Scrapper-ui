import { cn } from '@/lib/cn'
import { categoryStyle } from '@/lib/constants'
import { monogram } from '@/lib/format'

export interface SourceMonogramProps {
  name: string
  /** Category slug driving the tint. Omit for the neutral brand variant. */
  category?: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const SIZES = {
  sm: 'size-6 text-[10px]',
  md: 'size-7 text-[11px]',
  lg: 'size-10 text-body-sm',
} as const

/**
 * The entire visual identity of a publisher. Sources have no logo and no
 * `homepage_url`, so there is nothing to fetch and nothing to fall back to —
 * two letters tinted with the category accent is the design, not a placeholder.
 *
 * Decorative: the source name is always rendered as text beside or near it.
 */
export function SourceMonogram({
  name,
  category,
  size = 'md',
  className,
}: SourceMonogramProps) {
  const style = categoryStyle(category)

  return (
    <span
      aria-hidden
      className={cn(
        'inline-flex shrink-0 items-center justify-center rounded-micro font-body font-bold uppercase',
        SIZES[size],
        style.tint,
        style.text,
        className,
      )}
    >
      {monogram(name)}
    </span>
  )
}
