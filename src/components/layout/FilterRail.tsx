import { Link } from 'react-router'

import { useCategories } from '@/hooks/useCategories'
import { useSources } from '@/hooks/useSources'
import { cn } from '@/lib/cn'
import { categoryStyle } from '@/lib/constants'

export interface FilterRailProps {
  /** Active category slug, or undefined for "All". */
  category?: string
  /** Active source id, or undefined for "All sources". */
  source?: number
  onSourceChange: (source: number | undefined) => void
  className?: string
}

/**
 * Categories and sources, as two radiogroups.
 *
 * The comps show sources as a multi-select checkbox list. The backend filter is
 * a single-value `NumberFilter`, so a checkbox list would let the user select
 * three publishers and silently filter by one. It is a radiogroup until
 * `?source__in=` lands — see `.CLAUDE/context.md#known-backend-gaps`.
 *
 * Per-source counts are omitted for the same reason: the sources endpoint does
 * not carry one, and computing it client-side would mean fetching every article.
 */
export function FilterRail({
  category,
  source,
  onSourceChange,
  className,
}: FilterRailProps) {
  const { data: categories = [] } = useCategories()
  const { data: sources = [] } = useSources()
  const active = sources.filter((item) => item.is_active)

  return (
    <div className={cn('flex flex-col gap-6', className)}>
      <fieldset>
        <legend className="mb-3 text-label-sm text-ink uppercase">
          Categories
        </legend>

        <ul className="flex flex-col gap-1">
          <li>
            <RailLink to="/" selected={category === undefined}>
              <span>All</span>
            </RailLink>
          </li>

          {categories.map((item) => {
            const style = categoryStyle(item.slug)
            const selected = category === item.slug

            return (
              <li key={item.id}>
                <RailLink
                  to={`/c/${item.slug}`}
                  selected={selected}
                  className={selected ? cn(style.tint, style.text) : undefined}
                >
                  <span>{item.name}</span>
                  <span
                    className={cn(
                      'text-body-sm',
                      selected ? 'opacity-70' : 'text-ink-muted',
                    )}
                  >
                    {item.article_count.toLocaleString()}
                  </span>
                </RailLink>
              </li>
            )
          })}
        </ul>
      </fieldset>

      <hr className="border-hairline" />

      <fieldset>
        <legend className="mb-3 text-label-sm text-ink uppercase">Source</legend>

        <div role="radiogroup" aria-label="Source" className="flex flex-col gap-1">
          <RailRadio
            checked={source === undefined}
            onSelect={() => onSourceChange(undefined)}
          >
            All sources
          </RailRadio>

          {active.map((item) => (
            <RailRadio
              key={item.id}
              checked={source === item.id}
              onSelect={() => onSourceChange(item.id)}
            >
              {item.name}
            </RailRadio>
          ))}
        </div>
      </fieldset>
    </div>
  )
}

function RailLink({
  to,
  selected,
  className,
  children,
}: {
  to: string
  selected: boolean
  // Explicit `| undefined`: with exactOptionalPropertyTypes, `className?: string`
  // means "absent or a string" and rejects a passed-in undefined. Call sites
  // here pass undefined deliberately for the unselected case.
  className?: string | undefined
  children: React.ReactNode
}) {
  return (
    <Link
      to={to}
      {...(selected ? { 'aria-current': 'page' as const } : {})}
      className={cn(
        'flex items-center justify-between gap-3 rounded-micro px-2 py-1.5 text-body-sm',
        'transition-colors duration-(--duration-fast) ease-standard',
        selected
          ? 'font-medium'
          : 'text-ink-secondary hover:bg-hairline/60 hover:text-ink',
        className,
      )}
    >
      {children}
    </Link>
  )
}

function RailRadio({
  checked,
  onSelect,
  children,
}: {
  checked: boolean
  onSelect: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={checked}
      onClick={onSelect}
      className={cn(
        'flex items-center gap-2.5 rounded-micro px-2 py-1.5 text-left text-body-sm',
        'transition-colors duration-(--duration-fast) ease-standard',
        checked ? 'bg-brand-tint font-medium text-brand' : 'text-ink-secondary hover:bg-hairline/60 hover:text-ink',
      )}
    >
      <span
        aria-hidden
        className={cn(
          'flex size-4 shrink-0 items-center justify-center rounded-full border',
          checked ? 'border-brand' : 'border-border-interactive',
        )}
      >
        {checked ? <span className="size-2 rounded-full bg-brand" /> : null}
      </span>
      <span className="truncate">{children}</span>
    </button>
  )
}
