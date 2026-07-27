import { useEffect, useLayoutEffect, useRef } from 'react'
import { useLocation } from 'react-router'

const STORAGE_PREFIX = 'feed-scroll:'

/** Give up restoring once the content clearly is not coming back. */
const MAX_RESTORE_FRAMES = 60

/**
 * Restores the feed's scroll position after a trip to an article preview.
 *
 * Virtualization makes this manual: the browser's own restoration runs before
 * the virtualizer has reported a total size, so the document is still short and
 * the scroll gets clamped to the top of a near-empty page. This waits until the
 * page is actually tall enough before scrolling, then stops.
 *
 * Pairs with the long `gcTime` on the feed query — if the cached pages were
 * collected while the user was away, there is nothing to restore *to*.
 */
export function useFeedScrollRestore(key: string, ready: boolean): void {
  const location = useLocation()
  const storageKey = `${STORAGE_PREFIX}${location.key}:${key}`
  const restored = useRef(false)

  /**
   * Set the instant this screen starts unmounting.
   *
   * Navigating away scrolls the new route to the top, and that scroll fires a
   * `scroll` event while this listener is technically still attached — which
   * would save 0 over the position we are trying to keep. A layout-effect
   * cleanup runs during the same commit that removes this subtree, ahead of the
   * new route's scroll-to-top, so this flag is always set first.
   */
  const frozen = useRef(false)
  useLayoutEffect(() => {
    frozen.current = false
    return () => {
      frozen.current = true
    }
  }, [])

  useEffect(() => {
    let queued = false

    const save = () => {
      if (frozen.current || queued) return
      queued = true

      requestAnimationFrame(() => {
        queued = false
        if (frozen.current) return

        try {
          sessionStorage.setItem(storageKey, String(window.scrollY))
        } catch {
          // Private mode or a full quota: a scroll position is not worth throwing.
        }
      })
    }

    window.addEventListener('scroll', save, { passive: true })
    return () => window.removeEventListener('scroll', save)
  }, [storageKey])

  useEffect(() => {
    if (!ready || restored.current) return

    const saved = Number(sessionStorage.getItem(storageKey) ?? '')
    if (!saved || Number.isNaN(saved)) {
      restored.current = true
      return
    }

    let frame = 0
    let raf = 0

    const attempt = () => {
      const reachable =
        document.documentElement.scrollHeight - window.innerHeight >= saved

      if (reachable) {
        // `instant` overrides the global smooth scrolling, which would animate
        // a jump of several thousand pixels.
        window.scrollTo({ top: saved, behavior: 'instant' as ScrollBehavior })
        restored.current = true
        return
      }

      if (++frame < MAX_RESTORE_FRAMES) raf = requestAnimationFrame(attempt)
      else restored.current = true
    }

    raf = requestAnimationFrame(attempt)
    return () => cancelAnimationFrame(raf)
  }, [ready, storageKey])
}
