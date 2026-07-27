/**
 * @vitest-environment node
 *
 * Pure functions — no DOM. jsdom costs ~45s to boot on Windows, and running
 * every suite in it is what makes the pool time out waiting for workers.
 */
import { describe, expect, it } from 'vitest'

import { displayUrl, monogram, pluralise, relativeTime } from './format'

describe('monogram', () => {
  /** The real 14, verbatim from `/api/sources/`. */
  const SOURCES = [
    ['Al Jazeera', 'AJ'],
    ['Ars Technica', 'AT'],
    ['BBC News – Business', 'BN'],
    ['BBC News – Technology', 'BN'],
    ['BBC News – World', 'BN'],
    ['BBC Sport', 'BS'],
    ['CNBC', 'CN'],
    ['ESPN', 'ES'],
    ['NPR', 'NP'],
    ['TechCrunch', 'TC'],
    ['The Guardian – Business', 'TG'],
    ['The Guardian – Sport', 'TG'],
    ['The Guardian – World', 'TG'],
    ['The Verge', 'TV'],
  ] as const

  it.each(SOURCES)('derives %s → %s', (name, expected) => {
    expect(monogram(name)).toBe(expected)
  })

  it('splits on an en dash, not just a hyphen', () => {
    // U+2013. Splitting on "-" alone leaves this as a single word and the
    // monogram comes out as "BB" instead.
    expect(monogram('BBC News – World')).toBe('BN')
  })

  it('always returns two characters', () => {
    for (const [name] of SOURCES) {
      expect(monogram(name)).toHaveLength(2)
    }
    expect(monogram('X')).toHaveLength(2)
    expect(monogram('')).toHaveLength(2)
  })
})

describe('relativeTime', () => {
  const now = Date.parse('2026-07-27T12:00:00Z')

  it('reads under a minute as "now"', () => {
    expect(relativeTime('2026-07-27T11:59:30Z', now)).toBe('now')
  })

  it('counts minutes, then hours, then days', () => {
    expect(relativeTime('2026-07-27T11:26:00Z', now)).toBe('34m')
    expect(relativeTime('2026-07-27T09:00:00Z', now)).toBe('3h')
    expect(relativeTime('2026-07-25T12:00:00Z', now)).toBe('2d')
  })

  it('returns an empty string for an unparseable date rather than NaN', () => {
    expect(relativeTime('not a date', now)).toBe('')
  })
})

describe('displayUrl', () => {
  it('drops the scheme and www so the destination reads cleanly', () => {
    expect(displayUrl('https://www.espn.com/nba/story')).toBe('espn.com/nba/story')
  })

  it('truncates long paths', () => {
    const long = displayUrl(`https://espn.com/${'x'.repeat(100)}`, 24)
    expect(long).toHaveLength(24)
    expect(long.endsWith('…')).toBe(true)
  })
})

describe('pluralise', () => {
  it('picks the singular at exactly one', () => {
    expect(pluralise(1, 'story', 'stories')).toBe('1 story')
    expect(pluralise(0, 'story', 'stories')).toBe('0 stories')
    expect(pluralise(517, 'story', 'stories')).toBe('517 stories')
  })
})
