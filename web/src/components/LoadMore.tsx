import { useLoadMoreOnScroll, type PagedQuery } from '../lib/useLoadMoreOnScroll';

/**
 * End-of-list marker for paged lists: loads the next page as it scrolls near
 * view, shows a spinner while loading, and a Retry button if loading failed.
 * Put it as the last child of the list (or of the horizontal scroll row).
 */
export default function LoadMore({ query, axis = 'y' }: { query: PagedQuery; axis?: 'x' | 'y' }) {
  const sentinel = useLoadMoreOnScroll<HTMLDivElement>(query, axis);
  if (!query.hasNextPage) return null;
  return (
    <div ref={sentinel} className={`load-more load-more-${axis}`}>
      {query.isFetchNextPageError ? (
        <button className="link-btn" onClick={() => void query.fetchNextPage()} type="button">
          Couldn’t load more · Retry
        </button>
      ) : (
        <span className="load-more-spinner" role="status" aria-label="Loading more" />
      )}
    </div>
  );
}
