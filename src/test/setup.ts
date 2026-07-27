import { afterEach, vi } from 'vitest'

/**
 * Suites that need no DOM opt out with `@vitest-environment node` — jsdom costs
 * around 45 seconds to boot on Windows, and running every suite in it makes the
 * worker pool time out. This file has to survive both environments, so
 * everything DOM-shaped is guarded and imported dynamically.
 */
const hasDom = typeof window !== 'undefined'

if (hasDom) {
  await import('@testing-library/jest-dom/vitest')
  const { cleanup } = await import('@testing-library/react')

  afterEach(() => {
    cleanup()
  })

  // jsdom implements neither of these, and both are load-bearing in this UI:
  // matchMedia drives the responsive hooks and the reduced-motion check,
  // IntersectionObserver backs anything sentinel-driven.
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }),
  })

  // The window virtualizer constructs one on mount to watch the list element.
  // Without it every feed test throws before it renders a card.
  vi.stubGlobal(
    'ResizeObserver',
    class {
      observe = vi.fn()
      unobserve = vi.fn()
      disconnect = vi.fn()
    },
  )

  vi.stubGlobal(
    'IntersectionObserver',
    class {
      observe = vi.fn()
      unobserve = vi.fn()
      disconnect = vi.fn()
      takeRecords = vi.fn(() => [])
      root = null
      rootMargin = ''
      thresholds = []
    },
  )
}
