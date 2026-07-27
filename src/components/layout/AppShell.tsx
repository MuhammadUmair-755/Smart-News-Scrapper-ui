import { Outlet } from 'react-router'

import { Header } from '@/components/layout/Header'
import { MobileTabBar } from '@/components/layout/MobileTabBar'
import { SiteFooter } from '@/components/layout/SiteFooter'
import { useScrollToTop } from '@/hooks/useScrollToTop'

export function AppShell() {
  useScrollToTop()

  return (
    <div className="flex min-h-dvh flex-col">
      {/* First focusable element on the page — WCAG 2.4.1. */}
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-50 focus:rounded-control focus:bg-brand focus:px-4 focus:py-2 focus:text-white"
      >
        Skip to content
      </a>

      <Header />

      {/* Bottom padding clears the mobile tab bar. */}
      <main id="main" tabIndex={-1} className="flex-1 pb-14 outline-none md:pb-0">
        <Outlet />
      </main>

      <SiteFooter />
      <MobileTabBar />
    </div>
  )
}
