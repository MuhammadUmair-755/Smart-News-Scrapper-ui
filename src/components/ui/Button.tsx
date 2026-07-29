import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { Loader2 } from 'lucide-react'
import type { ButtonHTMLAttributes, ReactNode } from 'react'

import { cn } from '@/lib/cn'

const button = cva(
  [
    'inline-flex items-center justify-center gap-2 rounded-control font-body font-medium',
    'transition-all duration-(--duration-micro) ease-standard',
    'cursor-pointer',
    'disabled:pointer-events-none disabled:opacity-50',
  ],
  {
    variants: {
      variant: {
        primary: 'bg-brand text-white hover:bg-brand-hover active:scale-[0.99]',
        secondary:
          'border border-border-strong bg-surface text-ink hover:bg-sunken active:scale-[0.99]',
        ghost: 'text-ink-secondary hover:bg-sunken hover:text-ink',
        danger: 'bg-danger text-white hover:brightness-95 active:scale-[0.99]',
      },
      size: {
        // 44px keeps the mobile touch target legal on its own.
        md: 'h-11 px-5 text-body-sm',
        sm: 'h-9 px-4 text-body-sm',
        icon: 'size-11 shrink-0 rounded-full p-0',
      },
    },
    defaultVariants: { variant: 'primary', size: 'md' },
  },
)

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof button> {
  /** Render as the single child element instead — a `Link`, say. */
  asChild?: boolean
  /**
   * Swaps the label for a spinner. The button keeps its width so the layout
   * around it does not jump mid-action.
   */
  loading?: boolean
  children?: ReactNode
}

export function Button({
  className,
  variant,
  size,
  asChild = false,
  loading = false,
  disabled,
  children,
  ...props
}: ButtonProps) {
  const Component = asChild ? Slot : 'button'

  return (
    <Component
      className={cn(button({ variant, size }), className)}
      disabled={disabled ?? loading}
      {...(loading ? { 'aria-busy': true } : {})}
      {...props}
    >
      {loading ? (
        <>
          <Loader2 aria-hidden className="size-4 animate-spin" />
          <span className="sr-only">Loading</span>
          <span aria-hidden className="opacity-0">
            {children}
          </span>
        </>
      ) : (
        children
      )}
    </Component>
  )
}
