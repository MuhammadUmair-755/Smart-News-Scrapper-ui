import { useWindowVirtualizer } from '@tanstack/react-virtual'
import { useEffect, useLayoutEffect, useRef, useState } from 'react'

import type { Article } from '@/api/types'
import { ArticleCard } from '@/components/article/ArticleCard'
import { useFeedRows } from '@/components/article/useFeedRows'
import { useColumnCount } from '@/hooks/useMediaQuery'
import { cn } from '@/lib/cn'
import { PREFETCH_ROWS, ROW_ESTIMATE } from '@/lib/constants'

export interface ArticleListProps {
  articles: Article[]
  /** Total across every page. Drives `aria-setsize`, not `articles.length`. */
  total: number
  hasNextPage: boolean
  isFetchingNextPage: boolean
  fetchNextPage: () => void
  /** Entrance stagger runs on the first page only — see below. */
  animateEntrance?: boolean
  /** Articles rendered above this list (the lead story), for `aria-posinset`. */
  positionOffset?: number
}

/** Vertical gap between rows, matching the 24px grid gutter. */
const ROW_GAP = 24

/**
 * The feed body, shared by Home, Category and Search.
 *
 * Virtualized against the window rather than an inner scroll container, so the
 * page keeps one natural scrollbar and the sticky header, sticky pill bar and
 * footer all behave normally. Only the rows near the viewport exist in the DOM —
 * roughly fifteen cards, whether the feed holds twenty articles or five hundred.
 */
export function ArticleList({
  articles,
  total,
  hasNextPage,
  isFetchingNextPage,
  fetchNextPage,
  animateEntrance = false,
  positionOffset = 0,
}: ArticleListProps) {
  const columns = useColumnCount()
  const rows = useFeedRows(articles, columns)
  const listRef = useRef<HTMLDivElement>(null)

  /**
   * The list starts below the header, the freshness strip and (on Home) the
   * lead story. The virtualizer measures against the document, so it has to be
   * told how far down the list begins — and `start` has to have the same offset
   * subtracted again when positioning each row. Getting this wrong displaces
   * every row by the height of everything above the list.
   */
  const [scrollMargin, setScrollMargin] = useState(0)

  useLayoutEffect(() => {
    const element = listRef.current
    if (!element) return

    const measure = () => setScrollMargin(element.offsetTop)
    measure()

    const observer = new ResizeObserver(measure)
    observer.observe(document.body)
    return () => observer.disconnect()
  }, [])

  const virtualizer = useWindowVirtualizer({
    count: rows.length,
    estimateSize: () => (ROW_ESTIMATE[columns] ?? 240) + ROW_GAP,
    overscan: 4,
    scrollMargin,
    getItemKey: (index) => rows[index]?.[0]?.id ?? index,
  })

  // A resize across a breakpoint invalidates every measured row height.
  useEffect(() => {
    virtualizer.measure()
  }, [columns, virtualizer])

  const virtualRows = virtualizer.getVirtualItems()
  const lastRow = virtualRows[virtualRows.length - 1]

  /**
   * Infinite loading is driven by the virtual index, not a sentinel element —
   * a sentinel at the end of the list is never rendered when the end of the
   * list is virtualized away. Firing `PREFETCH_ROWS` early means the next page
   * is usually already in the cache by the time it is scrolled into view.
   */
  useEffect(() => {
    if (!lastRow || !hasNextPage || isFetchingNextPage) return
    if (lastRow.index >= rows.length - 1 - PREFETCH_ROWS) fetchNextPage()
  }, [lastRow, hasNextPage, isFetchingNextPage, rows.length, fetchNextPage])

  return (
    <div
      ref={listRef}
      role="feed"
      aria-busy={isFetchingNextPage}
      aria-label="Articles"
      className="relative w-full"
      style={{ height: virtualizer.getTotalSize() }}
    >
      {virtualRows.map((virtualRow) => {
        const row = rows[virtualRow.index]
        if (!row) return null

        return (
          <div
            key={virtualRow.key}
            data-index={virtualRow.index}
            ref={virtualizer.measureElement}
            className="absolute top-0 left-0 w-full"
            style={{
              transform: `translateY(${virtualRow.start - scrollMargin}px)`,
            }}
          >
            <div
              className={cn(
                // `items-start`, not the default stretch: a card must size to
                // its content. Letting cards fill the row height is what leaves
                // the hollow void below the footer — a real defect in the first
                // Stitch render, called out in .CLAUDE/design-system.md.
                'grid items-start gap-6 pb-6',
                columns === 3
                  ? 'grid-cols-3'
                  : columns === 2
                    ? 'grid-cols-2'
                    : 'grid-cols-1',
              )}
            >
              {row.map((article, columnIndex) => (
                <div
                  key={article.id}
                  /*
                    Stagger only on the first page. Animating appended rows
                    makes them flicker as the virtualizer measures them, and the
                    entrance would replay every time a row scrolls back in.
                  */
                  className={animateEntrance ? 'animate-enter' : undefined}
                  style={
                    animateEntrance
                      ? {
                          animationDelay: `${Math.min(
                            virtualRow.index * columns + columnIndex,
                            7,
                          ) * 40}ms`,
                        }
                      : undefined
                  }
                >
                  <ArticleCard
                    article={article}
                    position={
                      positionOffset + virtualRow.index * columns + columnIndex + 1
                    }
                    setSize={total}
                  />
                </div>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
