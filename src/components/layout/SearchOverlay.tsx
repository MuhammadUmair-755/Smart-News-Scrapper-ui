import * as Dialog from '@radix-ui/react-dialog'
import { VisuallyHidden } from '@radix-ui/react-visually-hidden'
import { Search, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'

import { Input } from '@/components/ui/Input'
import { cn } from '@/lib/cn'

export interface SearchOverlayProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

/**
 * The mobile search surface — full-screen and focused rather than a squeezed
 * desktop header. Radix traps focus, closes on Escape and restores focus to
 * whatever opened it.
 */
export function SearchOverlay({ open, onOpenChange }: SearchOverlayProps) {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')

  useEffect(() => {
    if (!open) setQuery('')
  }, [open])

  const submit = (event: React.FormEvent) => {
    event.preventDefault()
    const trimmed = query.trim()
    if (!trimmed) return

    onOpenChange(false)
    void navigate(`/search?q=${encodeURIComponent(trimmed)}`)
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-canvas" />
        <Dialog.Content
          className={cn(
            'fixed inset-0 z-50 flex flex-col bg-canvas',
            'data-[state=open]:animate-fade-in',
          )}
        >
          <VisuallyHidden>
            <Dialog.Title>Search stories</Dialog.Title>
          </VisuallyHidden>

          <form
            role="search"
            onSubmit={submit}
            className="flex items-center gap-3 border-b border-hairline px-4 py-3"
          >
            <Input
              autoFocus
              type="search"
              name="q"
              aria-label="Search stories"
              placeholder="Search stories…"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              leading={<Search aria-hidden className="size-5" />}
              {...(query
                ? {
                    trailing: (
                      <button
                        type="button"
                        aria-label="Clear search"
                        onClick={() => setQuery('')}
                        className="flex size-6 items-center justify-center rounded-full bg-hairline text-ink-secondary"
                      >
                        <X aria-hidden className="size-3.5" />
                      </button>
                    ),
                  }
                : {})}
            />

            <Dialog.Close className="shrink-0 px-2 py-2 text-body-sm font-medium text-brand">
              Cancel
            </Dialog.Close>
          </form>

          <p className="px-4 py-6 text-body-sm text-ink-secondary">
            Search runs across every headline and description in the feed.
          </p>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
