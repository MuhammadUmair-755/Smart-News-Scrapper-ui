import { useCallback, useSyncExternalStore } from 'react'

import { BREAKPOINT_DESKTOP, BREAKPOINT_TABLET } from '@/lib/constants'

/**
 * `useSyncExternalStore` rather than `useState` + effect: the first render
 * already has the right answer, so the feed never mounts at one column count
 * and immediately re-measures at another.
 */
export function useMediaQuery(query: string): boolean {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const list = window.matchMedia(query)
      list.addEventListener('change', onChange)
      return () => list.removeEventListener('change', onChange)
    },
    [query],
  )

  const getSnapshot = useCallback(() => window.matchMedia(query).matches, [query])

  return useSyncExternalStore(subscribe, getSnapshot, () => false)
}

/**
 * The feed's column count. Drives row chunking for the virtualizer, so it has
 * to be a number in JS and not only a CSS grid definition.
 */
export function useColumnCount(): number {
  const isTablet = useMediaQuery(BREAKPOINT_TABLET)
  const isDesktop = useMediaQuery(BREAKPOINT_DESKTOP)

  if (isDesktop) return 3
  if (isTablet) return 2
  return 1
}
