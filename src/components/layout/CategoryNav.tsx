import { NavLink } from 'react-router'

import { useCategories } from '@/hooks/useCategories'
import { cn } from '@/lib/cn'
import { categoryStyle } from '@/lib/constants'

/**
 * The persistent category nav in the header. Active state is an underline in
 * the category accent plus `aria-current` — colour is never the only signal.
 */
export function CategoryNav() {
  const { data: categories = [] } = useCategories()

  return (
    <nav aria-label="Categories" className="hidden items-center gap-1 md:flex">
      <NavLink
        to="/"
        end
        className={({ isActive }) =>
          cn(
            'rounded-micro px-2 py-1 text-label-md',
            'transition-colors duration-(--duration-fast) ease-standard',
            isActive
              ? 'border-b-2 border-brand text-brand'
              : 'text-ink-secondary hover:bg-sunken hover:text-ink',
          )
        }
      >
        Latest
      </NavLink>

      {categories.map((category) => {
        const style = categoryStyle(category.slug)

        return (
          <NavLink
            key={category.id}
            to={`/c/${category.slug}`}
            className={({ isActive }) =>
              cn(
                'rounded-micro px-2 py-1 text-label-md',
                'transition-colors duration-(--duration-fast) ease-standard',
                isActive
                  ? cn('border-b-2', style.border, style.text)
                  : 'text-ink-secondary hover:bg-sunken hover:text-ink',
              )
            }
          >
            {category.name}
          </NavLink>
        )
      })}
    </nav>
  )
}
