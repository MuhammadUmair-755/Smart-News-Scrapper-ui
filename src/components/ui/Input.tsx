import type { InputHTMLAttributes, ReactNode } from 'react'

import { cn } from '@/lib/cn'

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  /** Rendered inside the field's leading edge — a magnifier, typically. */
  leading?: ReactNode
  /** Rendered inside the trailing edge — a ⌘K chip or a clear button. */
  trailing?: ReactNode
}

export function Input({ className, leading, trailing, ...props }: InputProps) {
  return (
    <div className="relative flex items-center">
      {leading ? (
        <span
          aria-hidden
          className="pointer-events-none absolute left-3 flex text-ink-muted"
        >
          {leading}
        </span>
      ) : null}

      <input
        className={cn(
          'h-11 w-full rounded-control bg-surface text-body-sm text-ink',
          'placeholder:text-ink-muted',
          // border-interactive, never hairline: a control boundary must clear
          // 3:1 for WCAG 1.4.11 and hairline is 1.23:1.
          'border border-border-interactive',
          'transition-colors duration-(--duration-fast) ease-standard',
          'focus:border-brand focus:ring-2 focus:ring-brand/20 focus:outline-none',
          leading ? 'pl-10' : 'pl-3',
          trailing ? 'pr-12' : 'pr-3',
          className,
        )}
        {...props}
      />

      {trailing ? (
        <span className="absolute right-3 flex items-center">{trailing}</span>
      ) : null}
    </div>
  )
}
