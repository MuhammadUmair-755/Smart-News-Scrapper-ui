import { createBrowserRouter } from 'react-router'

import { AppShell } from '@/components/layout/AppShell'
import { AppSkeleton } from '@/components/layout/AppSkeleton'

/**
 * Every route is lazy, so the first paint ships the shell and the feed and
 * nothing else. Preview, Search and Sources arrive on navigation.
 *
 * `lazy` wants route properties rather than a component, hence the small
 * adapter — pages keep their default export, per `.CLAUDE/architecture.md`.
 */
export const router = createBrowserRouter([
  {
    element: <AppShell />,
    /**
     * Required, not optional polish: the first matched route is lazy, and a
     * data router renders the whole tree as its `HydrateFallback` until that
     * module resolves. Without one the app is a blank page on first paint.
     */
    HydrateFallback: AppSkeleton,
    children: [
      {
        index: true,
        lazy: async () => ({ Component: (await import('@/pages/HomeFeed')).default }),
      },
      {
        path: 'c/:slug',
        lazy: async () => ({
          Component: (await import('@/pages/CategoryFeed')).default,
        }),
      },
      {
        path: 'search',
        lazy: async () => ({
          Component: (await import('@/pages/SearchResults')).default,
        }),
      },
      {
        path: 'a/:id',
        lazy: async () => ({
          Component: (await import('@/pages/ArticlePreview')).default,
        }),
      },
      {
        path: 'sources',
        lazy: async () => ({
          Component: (await import('@/pages/SourcesDirectory')).default,
        }),
      },
      {
        path: '*',
        lazy: async () => ({ Component: (await import('@/pages/NotFound')).default }),
      },
    ],
  },
])
