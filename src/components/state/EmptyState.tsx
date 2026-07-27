import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'

import { cn } from '@/lib/cn'

export interface EmptyStateProps {
  icon: LucideIcon
  title: string
  /** One line. Says what happened and, ideally, why. */
  description: string
  /** The way out. An empty region with no exit is not an empty state. */
  action?: ReactNode
  className?: string
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-4 rounded-card',
        'border border-dashed border-border-strong bg-surface px-6 py-16 text-center',
        className,
      )}
    >
      <span className="flex size-12 items-center justify-center rounded-full bg-brand-tint text-brand">
        <Icon aria-hidden className="size-6" />
      </span>

      <div className="space-y-1">
        <h2 className="font-headline text-headline-sm text-ink">{title}</h2>
        <p className="mx-auto max-w-[46ch] text-body-md text-ink-secondary">
          {description}
        </p>
      </div>

      {action}
    </div>
  )
}
