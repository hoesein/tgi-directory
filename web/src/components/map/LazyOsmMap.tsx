import { lazy, Suspense } from 'react';
import type { OsmMapProps } from './OsmMap';

const OsmMap = lazy(() => import('./OsmMap'));

/** The OpenStreetMap view, downloaded on first use. */
export default function LazyOsmMap(props: OsmMapProps) {
  return (
    <Suspense fallback={<div className={`osm-map osm-map-loading ${props.className ?? ''}`}>Loading map…</div>}>
      <OsmMap {...props} />
    </Suspense>
  );
}
