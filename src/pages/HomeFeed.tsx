import { FeedScreen } from '@/components/feed/FeedScreen'

/**
 * The default landing surface: newest headlines across every category, with
 * the most recent promoted to a full-width lead.
 */
export default function HomeFeed() {
  return (
    <>
      <h1 className="sr-only">Latest stories</h1>

      <FeedScreen
        showLead
        scrollKey="home"
        emptyTitle="No stories yet"
        emptyDescription="The pipeline collects headlines every 30 minutes. Check back shortly."
      />
    </>
  )
}
