import { clsx, type ClassValue } from 'clsx'
import { extendTailwindMerge } from 'tailwind-merge'

/**
 * tailwind-merge has to be taught this design system's theme.
 *
 * Out of the box it only knows Tailwind's stock scale, so it cannot tell
 * `text-headline-lg` (a font size) from `text-tech` (a colour) — it files both
 * under one group and keeps only the last. That silently deletes the type scale
 * wherever a size and an accent meet, which is every eyebrow, pill and category
 * heading in the app. Listing the theme keys restores the distinction.
 *
 * Keep in sync with `src/styles/tokens.css`.
 */
const twMerge = extendTailwindMerge({
  extend: {
    theme: {
      text: [
        'display-lg',
        'display-md',
        'headline-lg',
        'headline-md',
        'headline-sm',
        'title-md',
        'body-lg',
        'body-md',
        'body-sm',
        'label-md',
        'label-sm',
      ],
      color: [
        'canvas',
        'surface',
        'sunken',
        'hairline',
        'border-strong',
        'border-interactive',
        'ink',
        'ink-secondary',
        'ink-muted',
        'brand',
        'brand-hover',
        'brand-tint',
        'tech',
        'tech-tint',
        'world',
        'world-tint',
        'business',
        'business-tint',
        'sports',
        'sports-tint',
        'success',
        'success-tint',
        'warning',
        'warning-tint',
        'danger',
        'danger-tint',
      ],
      font: ['headline', 'body'],
      radius: ['card', 'control', 'micro'],
      shadow: ['rest', 'hover', 'overlay'],
      container: ['shell', 'measure'],
      ease: ['standard', 'exit'],
      animate: ['shimmer', 'enter', 'fade-in', 'slide-up'],
    },
  },
})

/** Merge Tailwind classes so a caller's override actually wins. */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}
