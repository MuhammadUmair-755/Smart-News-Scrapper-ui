import { render, screen } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { describe, expect, it } from 'vitest'

import type { Article } from '@/api/types'

import { ArticleCard } from './ArticleCard'

/** The shape the API actually returns: no image, no summary, often no author. */
function makeArticle(overrides: Partial<Article> = {}): Article {
  return {
    id: 2296,
    title: 'Free agents: Boston bats remain hot after record week',
    url: 'https://www.espn.com/fantasy/baseball/story/_/id/49461610/',
    description: 'Here are the top players you should consider claiming.',
    ai_summary: null,
    author: 'Todd Zola',
    image_url: '',
    published_at: '2026-07-27T13:59:02Z',
    collected_at: '2026-07-27T13:00:57.579836Z',
    category: 'sports',
    category_name: 'Sports',
    source: 'ESPN',
    ...overrides,
  }
}

/**
 * A data router, not `MemoryRouter`: the card calls `useViewTransitionState`,
 * which throws outside one. The app uses `createBrowserRouter`, so this matches
 * how the component is really mounted.
 */
function renderCard(article: Article) {
  const router = createMemoryRouter([
    {
      path: '/',
      element: <ArticleCard article={article} position={1} setSize={517} />,
    },
  ])

  return render(<RouterProvider router={router} />)
}

describe('ArticleCard', () => {
  it('renders the headline as a link to the in-app preview, not the publisher', () => {
    const article = makeArticle()
    renderCard(article)

    const link = screen.getByRole('link', { name: article.title })
    expect(link).toHaveAttribute('href', '/a/2296')
  })

  it('gives the outbound link an accessible name that works out of context', () => {
    renderCard(makeArticle())

    const outbound = screen.getByRole('link', { name: /at ESPN, opens in a new tab/i })
    expect(outbound).toHaveAttribute('href', expect.stringContaining('espn.com'))
    expect(outbound).toHaveAttribute('rel', 'noopener noreferrer')
    expect(outbound).toHaveAttribute('target', '_blank')
  })

  it('renders category, source and relative time in the eyebrow', () => {
    renderCard(makeArticle())

    expect(screen.getByText('Sports')).toBeInTheDocument()
    expect(screen.getByText('ESPN')).toBeInTheDocument()
  })

  it('renders the author when present', () => {
    renderCard(makeArticle())
    expect(screen.getByText('Todd Zola')).toBeInTheDocument()
  })

  it('collapses the byline when author is "" — it is an empty string, not null', () => {
    renderCard(makeArticle({ author: '' }))

    expect(screen.queryByText('Todd Zola')).not.toBeInTheDocument()
    // The monogram still anchors the footer, so there is no hole where the
    // byline would have been.
    expect(screen.getByText('ES')).toBeInTheDocument()
  })

  it('renders no image element even though image_url exists on the type', () => {
    const { container } = renderCard(makeArticle({ image_url: '' }))
    expect(container.querySelector('img')).toBeNull()
  })

  it('renders nothing extra when ai_summary is null', () => {
    renderCard(makeArticle({ ai_summary: null }))
    expect(screen.queryByText(/summary/i)).not.toBeInTheDocument()
  })

  it('announces its position within the whole feed, not the loaded window', () => {
    renderCard(makeArticle())

    const card = screen.getByRole('article')
    expect(card).toHaveAttribute('aria-posinset', '1')
    expect(card).toHaveAttribute('aria-setsize', '517')
  })

  it('falls back to the brand accent for an unknown category slug', () => {
    renderCard(makeArticle({ category: 'weather', category_name: 'Weather' }))
    expect(screen.getByText('Weather')).toBeInTheDocument()
  })
})
