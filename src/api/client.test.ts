/**
 * @vitest-environment node
 *
 * `fetch` and `Response` are Node 20 globals, so the client needs no DOM.
 */
import { afterEach, describe, expect, it, vi } from 'vitest'

import { ApiError, request, toSearchParams } from './client'

function respondWith(body: unknown, status = 200) {
  vi.stubGlobal(
    'fetch',
    vi.fn(async () =>
      new Response(JSON.stringify(body), {
        status,
        headers: { 'Content-Type': 'application/json' },
      }),
    ),
  )
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('toSearchParams', () => {
  it('drops undefined and empty values so an untouched filter never reaches the URL', () => {
    expect(
      toSearchParams({ category: 'tech', source: undefined, search: '' }),
    ).toBe('?category=tech')
  })

  it('returns an empty string when nothing is set', () => {
    expect(toSearchParams({})).toBe('')
  })

  it('keeps a zero, which is a real value', () => {
    expect(toSearchParams({ page: 0 })).toBe('?page=0')
  })
})

describe('request error normalisation', () => {
  it('reads DRF shape A — a detail string', async () => {
    respondWith({ detail: 'No Article matches the given query.' }, 404)

    await expect(request('/articles/9999/')).rejects.toMatchObject({
      status: 404,
      message: 'No Article matches the given query.',
    })
  })

  it('reads DRF shape B — field-keyed arrays', async () => {
    respondWith({ source: ['Enter a number.'] }, 400)

    await expect(request('/articles/')).rejects.toMatchObject({
      status: 400,
      message: 'Enter a number.',
    })
  })

  it('falls back to a generic message for an unrecognised body', async () => {
    respondWith({ weird: { nested: true } }, 500)

    await expect(request('/articles/')).rejects.toMatchObject({
      status: 500,
      message: 'The server is not responding.',
    })
  })

  it('reports an unreachable server as status 0', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => {
        throw new TypeError('Failed to fetch')
      }),
    )

    const error = await request('/articles/').catch((thrown: unknown) => thrown)
    expect(error).toBeInstanceOf(ApiError)
    expect(error).toMatchObject({ status: 0 })
  })

  it('classifies 4xx as a client error and 5xx as not', () => {
    expect(new ApiError('gone', 404).isClientError).toBe(true)
    expect(new ApiError('boom', 500).isClientError).toBe(false)
    expect(new ApiError('offline', 0).isClientError).toBe(false)
  })

  it('returns parsed JSON on success', async () => {
    respondWith({ count: 517, next: null, previous: null, results: [] })

    await expect(request('/articles/')).resolves.toMatchObject({ count: 517 })
  })
})
