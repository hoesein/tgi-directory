import { useEffect } from 'react';

/** Touches that start this close to the left edge are iOS's swipe-back gesture. */
const EDGE_WIDTH = 20;

/** Maps keep pinch zoom; everything else in the app is fixed scale. */
function insideMap(target: EventTarget | null): boolean {
  return target instanceof Element && !!target.closest('.leaflet-container');
}

/**
 * iOS gesture guards:
 * - No pinch zoom (Safari ignores `user-scalable=no`, so block its gesture events).
 * - On tab pages (`blockSwipeBack`), no edge swipe back: tabs are the root of the app.
 */
export function useIosGestureGuards(blockSwipeBack: boolean) {
  useEffect(() => {
    const stopZoom = (event: Event) => {
      if (!insideMap(event.target)) event.preventDefault();
    };
    const events = ['gesturestart', 'gesturechange', 'gestureend'];
    events.forEach((name) => document.addEventListener(name, stopZoom, { passive: false }));
    return () => events.forEach((name) => document.removeEventListener(name, stopZoom));
  }, []);

  useEffect(() => {
    if (!blockSwipeBack) return;
    const stopEdgeSwipe = (event: TouchEvent) => {
      const touch = event.touches[0];
      if (touch && touch.clientX < EDGE_WIDTH) event.preventDefault();
    };
    document.addEventListener('touchstart', stopEdgeSwipe, { passive: false });
    return () => document.removeEventListener('touchstart', stopEdgeSwipe);
  }, [blockSwipeBack]);
}
