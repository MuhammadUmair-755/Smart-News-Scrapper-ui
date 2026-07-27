import { AlertTriangle, RotateCw } from 'lucide-react'

import { ApiError } from '@/api/client'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/cn'

export interface ErrorStateProps {
  error: unknown
  onRetry?: () => void
  /**
   * Renders as a banner rather than a block — used above a feed that still has
   * readable cached content beneath it.
   */
  variant?: 'block' | 'banner'
  className?: string
}

function describe(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.status === 0) {
      return 'Could not reach the server. Check that the API is running.'
    }
    return error.message
  }
  return 'Something went wrong while loading this page.'
}

export function ErrorState({
  error,
  onRetry,
  variant = 'block',
  className,
}: ErrorStateProps) {
  const message = describe(error)

  if (variant === 'banner') {
    return (
      <div
        role="alert"
        className={cn(
          'flex flex-wrap items-center gap-3 rounded-card border border-danger/30',
          'bg-danger-tint px-4 py-3 text-body-sm text-ink',
          className,
        )}
      >
        <AlertTriangle aria-hidden className="size-4 shrink-0 text-danger" />
        <span className="flex-1">{message}</span>
        {onRetry ? (
          <Button variant="secondary" size="sm" onClick={onRetry}>
            <RotateCw aria-hidden className="size-4" />
            Retry
          </Button>
        ) : null}
      </div>
    )
  }

  return (
    <div
      role="alert"
      className={cn(
        'flex flex-col items-center justify-center gap-4 rounded-card',
        'border border-hairline bg-surface px-6 py-16 text-center',
        className,
      )}
    >
      <span className="flex size-12 items-center justify-center rounded-full bg-danger-tint text-danger">
        <AlertTriangle aria-hidden className="size-6" />
      </span>

      <div className="space-y-1">
        <h2 className="font-headline text-headline-sm text-ink">
          That didn&rsquo;t load
        </h2>
        <p className="mx-auto max-w-[46ch] text-body-md text-ink-secondary">
          {message}
        </p>
      </div>

      {onRetry ? (
        <Button variant="secondary" onClick={onRetry}>
          <RotateCw aria-hidden className="size-4" />
          Try again
        </Button>
      ) : null}
    </div>
  )
}
