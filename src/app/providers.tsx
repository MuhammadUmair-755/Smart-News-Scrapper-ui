import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Component, useState, type ErrorInfo, type ReactNode } from 'react'

import { ApiError } from '@/api/client'
import { ErrorState } from '@/components/state/ErrorState'

function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        /**
         * The pipeline writes every 30 minutes, so nothing here is fast-moving.
         * A minute is short enough that a returning tab picks up new items and
         * long enough that navigating around does not refetch constantly.
         */
        staleTime: 60_000,
        /**
         * Load-bearing. The feed's accumulated pages have to survive a trip to
         * an article preview and back — if they are collected while the user is
         * away, the feed drops to page one and the restored scroll position
         * points at nothing.
         */
        gcTime: 30 * 60_000,
        refetchOnWindowFocus: false,
        // A 4xx is the caller's fault and fails identically on retry.
        retry: (failureCount, error) =>
          !(error instanceof ApiError && error.isClientError) && failureCount < 2,
      },
    },
  })
}

interface ErrorBoundaryState {
  error: Error | null
}

/**
 * The last line of defence. Components render `ErrorState` from normalised
 * query errors; this only catches a render-time throw.
 */
class ErrorBoundary extends Component<{ children: ReactNode }, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Unhandled render error', error, info.componentStack)
  }

  render() {
    if (this.state.error) {
      return (
        <div className="mx-auto w-full max-w-(--container-shell) px-4 py-24 sm:px-8">
          <ErrorState
            error={this.state.error}
            onRetry={() => this.setState({ error: null })}
          />
        </div>
      )
    }

    return this.props.children
  }
}

export function Providers({ children }: { children: ReactNode }) {
  // Created once per mount, never on re-render.
  const [queryClient] = useState(createQueryClient)

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </ErrorBoundary>
  )
}
