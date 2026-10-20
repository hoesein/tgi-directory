import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';

export type PageAnimation = '' | 'page-forward' | 'page-back' | 'page-fade';

let backPending = false;

/** Call right before a "back" navigation that uses navigate(path, { replace }) instead of history back. */
export function markBackNavigation(): void {
  backPending = true;
}

function takeBackNavigation(): boolean {
  const pending = backPending;
  backPending = false;
  return pending;
}

/** Scroll position per history entry (for Back) and per tab (for tab switches). */
const scrollByEntry = new Map<string, number>();
const scrollByTab = new Map<string, number>();

/**
 * Native-app navigation feel:
 * - returns the page animation for the route just opened (slide forward, slide back, or fade between tabs);
 * - remembers scroll positions: Back returns to where you were, and each tab keeps its own position.
 * Query-only changes (filters, search typing) neither animate nor scroll.
 */
export function useNativeNavigation(tabPaths: readonly string[]): PageAnimation {
  const location = useLocation();
  const navigationType = useNavigationType();
  const [animation, setAnimation] = useState<PageAnimation>('');
  const current = useRef({ key: location.key, path: location.pathname });
  const lastPath = useRef<string | null>(null);

  useEffect(() => {
    if ('scrollRestoration' in window.history) window.history.scrollRestoration = 'manual';
    const remember = () => {
      const { key, path } = current.current;
      scrollByEntry.set(key, window.scrollY);
      if (tabPaths.includes(path)) scrollByTab.set(path, window.scrollY);
    };
    window.addEventListener('scroll', remember, { passive: true });
    return () => window.removeEventListener('scroll', remember);
  }, [tabPaths]);

  useLayoutEffect(() => {
    const from = lastPath.current;
    const to = location.pathname;
    lastPath.current = to;
    current.current = { key: location.key, path: to };
    const back = takeBackNavigation();
    // First load, or only the query string changed.
    if (from === null || from === to) return;

    const isPop = navigationType === 'POP';
    if (back || isPop) setAnimation('page-back');
    else if (tabPaths.includes(from) && tabPaths.includes(to)) setAnimation('page-fade');
    else if (navigationType === 'PUSH') setAnimation('page-forward');
    else setAnimation('');

    const saved = isPop ? scrollByEntry.get(location.key) : tabPaths.includes(to) ? scrollByTab.get(to) : undefined;
    if (!saved) {
      window.scrollTo(0, 0);
      return;
    }
    // The page may still be filling in (cached lists render a frame later): retry for up to ~1 s.
    let frame = 0;
    let tries = 0;
    const restore = () => {
      window.scrollTo(0, saved);
      if (Math.abs(window.scrollY - saved) > 2 && tries++ < 60) frame = requestAnimationFrame(restore);
    };
    restore();
    return () => cancelAnimationFrame(frame);
    // Runs once per navigation; tabPaths is a constant.
  }, [location.key]);

  return animation;
}
