import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { Check, ChevronDown } from 'lucide-react'

import type { Ordering } from '@/api/types'
import { cn } from '@/lib/cn'
import { ORDERING_OPTIONS } from '@/lib/constants'

export interface SortMenuProps {
  value: Ordering
  onChange: (value: Ordering) => void
}

export function SortMenu({ value, onChange }: SortMenuProps) {
  const active = ORDERING_OPTIONS.find((option) => option.value === value)

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger
        className={cn(
          'inline-flex h-9 shrink-0 items-center gap-2 rounded-control px-3',
          'border border-border-interactive bg-surface text-label-md text-ink',
          'transition-colors duration-(--duration-fast) ease-standard',
          'hover:bg-sunken data-[state=open]:border-brand',
        )}
      >
        <span className="sr-only">Sort by</span>
        {active?.label ?? 'Sort'}
        <ChevronDown aria-hidden className="size-4 text-ink-muted" />
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          sideOffset={6}
          className={cn(
            'z-50 min-w-[200px] rounded-control border border-hairline',
            'bg-surface p-1 shadow-overlay',
            'data-[state=open]:animate-fade-in',
          )}
        >
          <DropdownMenu.RadioGroup
            value={value}
            onValueChange={(next) => onChange(next as Ordering)}
          >
            {ORDERING_OPTIONS.map((option) => (
              <DropdownMenu.RadioItem
                key={option.value}
                value={option.value}
                className={cn(
                  'flex cursor-pointer items-center justify-between gap-3 rounded-micro',
                  'px-3 py-2 text-body-sm text-ink outline-none',
                  'data-[highlighted]:bg-brand-tint data-[highlighted]:text-brand',
                )}
              >
                {option.label}
                <DropdownMenu.ItemIndicator>
                  <Check aria-hidden className="size-4" />
                </DropdownMenu.ItemIndicator>
              </DropdownMenu.RadioItem>
            ))}
          </DropdownMenu.RadioGroup>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  )
}
