import * as Dialog from '@radix-ui/react-dialog'
import { X } from 'lucide-react'
import type { ReactNode } from 'react'

import { cn } from '@/lib/cn'

export interface DrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  children: ReactNode
  /** Rendered pinned to the bottom of the panel — "Clear all", typically. */
  footer?: ReactNode
}

/**
 * The mobile home for the filter rail. Radix handles the focus trap, the
 * scroll lock, Escape and returning focus to the trigger on close.
 */
export function Drawer({
  open,
  onOpenChange,
  title,
  children,
  footer,
}: DrawerProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay
          className={cn(
            'fixed inset-0 z-50 bg-ink/30 backdrop-blur-[2px]',
            'data-[state=open]:animate-fade-in',
          )}
        />
        <Dialog.Content
          className={cn(
            'fixed inset-x-0 bottom-0 z-50 flex max-h-[85dvh] flex-col',
            'rounded-t-[16px] border-t border-hairline bg-canvas shadow-overlay',
            'data-[state=open]:animate-slide-up',
            'sm:inset-y-0 sm:right-0 sm:left-auto sm:max-h-none sm:w-[320px]',
            'sm:rounded-none sm:border-t-0 sm:border-l',
          )}
        >
          <div className="flex items-center justify-between border-b border-hairline px-5 py-4">
            <Dialog.Title className="font-headline text-headline-sm text-ink">
              {title}
            </Dialog.Title>
            <Dialog.Close
              aria-label="Close filters"
              className="flex size-11 items-center justify-center rounded-full text-ink-secondary hover:bg-sunken"
            >
              <X aria-hidden className="size-5" />
            </Dialog.Close>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">{children}</div>

          {footer ? (
            <div className="border-t border-hairline px-5 py-4">{footer}</div>
          ) : null}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
