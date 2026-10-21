import { useEffect, useRef } from 'react';

export interface PagedQuery {
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  /** The last next-page request failed; wait for a manual retry instead of looping. */
  isFetchNextPageError: boolean;
  fetchNextPage: () => unknown;
}

/** How far ahead of the end the next page starts loading. */
const LOOKAHEAD_PX = 400;

/**
 * Fetch the next page when the returned sentinel element comes near view.
 * `axis: 'x'` watches a horizontal scroll row (the sentinel's parent);
 * `axis: 'y'` watches the page. Works with any `useInfiniteQuery` result.
 */
export function useLoadMoreOnScroll<T extends HTMLElement>(query: PagedQuery, axis: 'x' | 'y' = 'y') {
  const sentinel = useRef<T>(null);
  const { hasNextPage, isFetchingNextPage, isFetchNextPageError, fetchNextPage } = query;
  const fetchRef = useRef(fetchNextPage);
  fetchRef.current = fetchNextPage;

  useEffect(() => {
    const element = sentinel.current;
    if (!element || !hasNextPage || isFetchingNextPage || isFetchNextPageError) return;
    if (typeof IntersectionObserver === 'undefined') return;
    // A fresh observer reports the current state at once, so a short page whose
    // end is already in view keeps loading until it fills the screen.
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          observer.disconnect();
          void fetchRef.current();
        }
      },
      axis === 'x'
        ? { root: element.parentElement, rootMargin: `0px ${LOOKAHEAD_PX}px 0px 0px` }
        : { rootMargin: `0px 0px ${LOOKAHEAD_PX}px 0px` },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [axis, hasNextPage, isFetchingNextPage, isFetchNextPageError]);

  return sentinel;
}
