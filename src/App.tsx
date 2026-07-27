/**
 * Placeholder shell — Stage 1 only.
 *
 * This renders the design tokens so `npm run dev` proves the scaffold is wired
 * correctly (fonts loaded, Tailwind theme resolving, colours correct) before
 * any real screen exists. Stage 2 replaces this entirely with the router and
 * app shell; see .CLAUDE/plan.md.
 */
export default function App() {
  const accents = [
    ['Tech', 'text-tech', 'bg-tech-tint'],
    ['World', 'text-world', 'bg-world-tint'],
    ['Business', 'text-business', 'bg-business-tint'],
    ['Sports', 'text-sports', 'bg-sports-tint'],
  ] as const

  return (
    <main className="mx-auto max-w-(--container-shell) px-6 py-16">
      <p className="text-label-sm text-ink-muted uppercase">
        Stage 1 · Scaffold
      </p>

      <h1 className="mt-4 font-headline text-display-md text-ink">
        Smart News Aggregator
      </h1>

      <p className="mt-4 max-w-(--container-measure) text-body-lg text-ink-secondary">
        If this headline is a serif and this paragraph is not, the fonts are
        loaded. If the card below is warm white on warm paper, the theme
        resolved. Nothing else is built yet.
      </p>

      <div className="mt-10 rounded-card border border-hairline bg-surface p-6 shadow-rest">
        <div className="flex flex-wrap gap-2">
          {accents.map(([label, text, tint]) => (
            <span
              key={label}
              className={`rounded-full px-3 py-1 text-label-sm uppercase ${text} ${tint}`}
            >
              {label}
            </span>
          ))}
        </div>

        <p className="mt-4 text-body-sm text-ink-muted">
          Four category accents, fixed assignments — see{' '}
          <code className="rounded-micro bg-sunken px-1.5 py-0.5">
            .CLAUDE/design-system.md
          </code>
          .
        </p>
      </div>
    </main>
  )
}
