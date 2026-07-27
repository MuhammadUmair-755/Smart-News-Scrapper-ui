import type { ReactNode } from 'react'
import { Link } from 'react-router'

import { cn } from '@/lib/cn'
import { categoryStyle } from '@/lib/constants'

export interface PillProps {
  to: string
  children: ReactNode
  /** Count rendered inside the pill and folded into its accessible name. */
  count?: number
  selected?: boolean
  /** Slug driving the accent. Omit for the neutral "All" pill. */
  accent?: string
  className?: string
}

/**
 * A filter pill in the feed toolbar. Selection is conveyed by border, tint and
 * `aria-current` — never by colour alone.
 */
export function Pill({
  to,
  children,
  count,
  selected = false,
  accent,
  className,
}: PillProps) {
  const style = categoryStyle(accent)

  return (
    <Link
      to={to}
      {...(selected ? { 'aria-current': 'page' as const } : {})}
      className={cn(
        'inline-flex h-8 shrink-0 items-center gap-1.5 rounded-full border px-3',
        'text-label-md whitespace-nowrap',
        'transition-colors duration-(--duration-fast) ease-standard',
        selected
          ? cn(style.border, style.tint, style.text)
          : cn('border-hairline text-ink-secondary', style.hover),
        className,
      )}
    >
      {children}
      {count === undefined ? null : (
        <span className={cn('text-body-sm', selected ? 'opacity-70' : 'text-ink-muted')}>
          {count.toLocaleString()}
        </span>
      )}
    </Link>
  )
}
