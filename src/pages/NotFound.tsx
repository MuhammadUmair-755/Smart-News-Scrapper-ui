import { FileQuestion } from 'lucide-react'
import { Link } from 'react-router'

import { EmptyState } from '@/components/state/EmptyState'
import { Button } from '@/components/ui/Button'

export default function NotFound() {
  return (
    <div className="mx-auto w-full max-w-(--container-shell) px-4 py-24 sm:px-8">
      <h1 className="sr-only">Page not found</h1>

      <EmptyState
        icon={FileQuestion}
        title="We couldn't find that page"
        description="The link may be out of date, or the story may no longer be in the feed."
        action={
          <Button asChild>
            <Link to="/">Back to the feed</Link>
          </Button>
        }
      />
    </div>
  )
}
