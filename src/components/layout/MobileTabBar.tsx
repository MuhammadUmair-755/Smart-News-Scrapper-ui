import { Newspaper, Radio, Search } from 'lucide-react'
import { NavLink } from 'react-router'

import { cn } from '@/lib/cn'

/**
 * Three tabs, not four. The comps show a Saved tab; there is no user model, no
 * auth and no bookmark table behind it, so it gets no entry point here.
 *
 * Labels are always visible — never icon-only — and every target is 44px.
 */
const TABS = [
  { to: '/', label: 'Feed', icon: Newspaper, end: true },
  { to: '/search', label: 'Search', icon: Search, end: false },
  { to: '/sources', label: 'Sources', icon: Radio, end: false },
] as const

export function MobileTabBar() {
  return (
    <nav
      aria-label="Primary"
      className={cn(
        'fixed inset-x-0 bottom-0 z-40 border-t border-hairline bg-surface md:hidden',
        'pb-[env(safe-area-inset-bottom)]',
      )}
    >
      <ul className="flex">
        {TABS.map((tab) => (
          <li key={tab.to} className="flex-1">
            <NavLink
              to={tab.to}
              end={tab.end}
              className={({ isActive }) =>
                cn(
                  'flex h-14 flex-col items-center justify-center gap-1',
                  'text-[11px] font-semibold',
                  'transition-colors duration-(--duration-micro) ease-standard',
                  isActive ? 'text-brand' : 'text-ink-muted',
                )
              }
            >
              {({ isActive }) => (
                <>
                  <tab.icon
                    aria-hidden
                    className="size-5"
                    strokeWidth={isActive ? 2.4 : 2}
                  />
                  {tab.label}
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}
