/**
 * @vitest-environment node
 */
import { describe, expect, it } from 'vitest'

import { cn } from './cn'

/**
 * Regression cover for a silent, system-wide failure.
 *
 * tailwind-merge only knows Tailwind's stock scale unless it is told otherwise.
 * Without the theme extension it cannot tell `text-headline-lg` (a size) from
 * `text-tech` (a colour), files them in one group and keeps only the last —
 * deleting the type scale from every eyebrow, pill and category heading. It
 * fails with no error and no warning; the text just renders at the inherited
 * size.
 */
describe('cn — custom theme awareness', () => {
  it('keeps a font size and an accent colour together', () => {
    const result = cn('font-headline text-headline-lg', 'text-tech')

    expect(result).toContain('text-headline-lg')
    expect(result).toContain('text-tech')
  })

  it('keeps every size/colour pair the design system actually uses', () => {
    const pairs = [
      ['text-label-sm', 'text-ink-muted'],
      ['text-body-sm', 'text-ink-secondary'],
      ['text-headline-sm', 'text-brand'],
      ['text-display-md', 'text-sports'],
      ['text-title-md', 'text-business'],
    ] as const

    for (const [size, colour] of pairs) {
      const result = cn(size, colour)
      expect(result, `${size} + ${colour}`).toContain(size)
      expect(result, `${size} + ${colour}`).toContain(colour)
    }
  })

  it('still collapses genuine conflicts, so overrides win', () => {
    expect(cn('text-body-sm', 'text-body-lg')).toBe('text-body-lg')
    expect(cn('text-ink', 'text-brand')).toBe('text-brand')
    expect(cn('rounded-card', 'rounded-full')).toBe('rounded-full')
    expect(cn('shadow-rest', 'shadow-hover')).toBe('shadow-hover')
  })

  it('does not confuse a border colour with a border width', () => {
    const result = cn('border border-hairline', 'border-l-[3px] border-l-tech')

    expect(result).toContain('border-hairline')
    expect(result).toContain('border-l-[3px]')
    expect(result).toContain('border-l-tech')
  })
})
