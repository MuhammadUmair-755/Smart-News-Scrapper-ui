import { useEffect, useState } from 'react'

/**
 * Search fires on the debounced value, never per keystroke. 300ms is the
 * figure in `.CLAUDE/requirements.md` F3.
 */
export function useDebounce<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = useState(value)

  useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(value), delay)
    return () => window.clearTimeout(timer)
  }, [value, delay])

  return debounced
}
