import { useLayoutEffect } from 'react'
import { useLocation, useNavigationType } from 'react-router'

/**
 * Sends a new navigation to the top of the page.
 *
 * A data router does not reset scroll by itself, so opening a preview from
 * halfway down the feed would land the reader at the preview's footer. Only
 * PUSH and REPLACE are reset — POP is a back/forward, where the feed's own
 * restoration hook puts the reader back where they were.
 *
 * `behavior: 'instant'` overrides the global `scroll-behavior: smooth`, which
 * would otherwise animate a jump of several thousand pixels.
 */
export function useScrollToTop(): void {
  const location = useLocation()
  const navigationType = useNavigationType()

  useLayoutEffect(() => {
    if (navigationType === 'POP') return
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior })
  }, [location.pathname, location.search, navigationType])
}
