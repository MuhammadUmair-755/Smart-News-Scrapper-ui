import { request } from './client'
import type { Article, ArticleQuery, Paginated } from './types'

/** The API silently clamps anything larger and then echoes the request back. */
const MAX_PAGE_SIZE = 100

export function getArticles(
  query: ArticleQuery = {},
): Promise<Paginated<Article>> {
  const { page_size, ...rest } = query

  return request<Paginated<Article>>('/articles/', {
    ...rest,
    ...(page_size === undefined
      ? {}
      : { page_size: Math.min(page_size, MAX_PAGE_SIZE) }),
  })
}

export function getArticle(id: number): Promise<Article> {
  return request<Article>(`/articles/${id}/`)
}
