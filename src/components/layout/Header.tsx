import { Search } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router'

// import { CategoryNav } from '@/components/layout/CategoryNav'
import { SearchOverlay } from '@/components/layout/SearchOverlay'
import { Input } from '@/components/ui/Input'
import { cn } from '@/lib/cn'

/**
 * Sticky, translucent, blurred. Holds the wordmark, the category nav and the
 * search entry point — inline from tablet up, an icon opening the full-screen
 * overlay below that.
 */
export function Header() {
  const navigate = useNavigate()
  const [overlayOpen, setOverlayOpen] = useState(false)
  const [query, setQuery] = useState('')

  // ⌘K / Ctrl-K from anywhere.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === 'k' && (event.metaKey || event.ctrlKey)) {
        event.preventDefault()
        setOverlayOpen(true)
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  const submit = (event: React.FormEvent) => {
    event.preventDefault()
    const trimmed = query.trim()
    if (!trimmed) return
    void navigate(`/search?q=${encodeURIComponent(trimmed)}`)
  }

  return (
    <>
      <header
        className={cn(
          'sticky top-0 z-40 border-b border-hairline',
          'bg-canvas/90 backdrop-blur-sm',
        )}
      >
        <div className="mx-auto flex h-16 w-full max-w-(--container-shell) items-center justify-between gap-6 px-4 sm:px-8">
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-3">
              <span aria-hidden className="size-5 rounded-micro bg-brand" />
              <span className="font-headline text-headline-md font-bold text-ink">
                Aggregator
              </span>
            </Link>

            {/* <CategoryNav /> */}
          </div>

          <div className="flex items-center gap-2">
            <form
              role="search"
              onSubmit={submit}
              className="hidden w-72 lg:block"
            >
              <Input
                type="search"
                name="q"
                aria-label="Search stories"
                placeholder="Search stories…"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                leading={<Search aria-hidden className="size-4" />}
                trailing={
                  <kbd
                    aria-hidden
                    className="rounded-micro border border-hairline bg-sunken px-1.5 py-0.5 text-[11px] text-ink-muted"
                  >
                    ⌘K
                  </kbd>
                }
              />
            </form>

            <button
              type="button"
              onClick={() => setOverlayOpen(true)}
              className={cn(
                'flex size-11 items-center justify-center rounded-full lg:hidden',
                'text-ink-secondary transition-colors duration-(--duration-micro)',
                'hover:bg-sunken hover:text-ink',
              )}
            >
              <Search aria-hidden className="size-5" />
              <span className="sr-only">Search stories</span>
            </button>
          </div>
        </div>
      </header>

      <SearchOverlay open={overlayOpen} onOpenChange={setOverlayOpen} />
    </>
  )
}
