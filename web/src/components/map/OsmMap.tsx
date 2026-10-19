// Leaflet + OpenStreetMap tiles. Always loaded with React.lazy (see LazyOsmMap)
// so the map library only downloads when a map is shown.
import 'leaflet/dist/leaflet.css';
import { useEffect, useMemo, useState } from 'react';
import L from 'leaflet';
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from 'react-leaflet';
import { CITY_ZOOM, OSM_ATTRIBUTION, OSM_TILES, PLACE_ZOOM, TAUNGGYI, round6, type LatLng } from '../../lib/maps';

// Inline SVG pin, so no marker image files need bundling.
const pinIcon = L.divIcon({
  className: '',
  html: `<svg xmlns="http://www.w3.org/2000/svg" width="34" height="44" viewBox="0 0 32 40" aria-hidden="true">
    <path d="M16 0C7.2 0 0 7 0 15.7 0 27.5 16 40 16 40s16-12.5 16-24.3C32 7 24.8 0 16 0z" fill="#14532d"/>
    <circle cx="16" cy="15.5" r="6" fill="#fff"/></svg>`,
  iconSize: [34, 44],
  iconAnchor: [17, 44],
});

function PickOnTap({ onPick }: { onPick: (point: LatLng) => void }) {
  useMapEvents({
    click: (event) => onPick({ lat: round6(event.latlng.lat), lng: round6(event.latlng.lng) }),
  });
  return null;
}

/** Pan to a point set from outside the map (GPS button, cleared value). */
function FollowPoint({ point }: { point: LatLng | null }) {
  const map = useMap();
  const lat = point?.lat;
  const lng = point?.lng;
  useEffect(() => {
    if (lat === undefined || lng === undefined) return;
    const target = L.latLng(lat, lng);
    if (!map.getBounds().pad(-0.15).contains(target)) {
      map.setView(target, Math.max(map.getZoom(), PLACE_ZOOM - 1));
    }
  }, [map, lat, lng]);
  return null;
}

/** Leaflet measures its box once; re-measure when the container is resized (sheets, rotation). */
function KeepSized() {
  const map = useMap();
  useEffect(() => {
    const observer = new ResizeObserver(() => map.invalidateSize());
    observer.observe(map.getContainer());
    return () => observer.disconnect();
  }, [map]);
  return null;
}

export interface OsmMapProps {
  point: LatLng | null;
  /** Set → tap or drag the pin to choose a point. Unset → view only. */
  onPick?: (point: LatLng) => void;
  className?: string;
  label: string;
}

export default function OsmMap({ point, onPick, className, label }: OsmMapProps) {
  const [tileErrors, setTileErrors] = useState(0);
  const [tilesLoaded, setTilesLoaded] = useState(false);
  const offline = !tilesLoaded && tileErrors >= 4;

  const markerHandlers = useMemo(
    () => ({
      dragend: (event: L.LeafletEvent) => {
        const { lat, lng } = (event.target as L.Marker).getLatLng();
        onPick?.({ lat: round6(lat), lng: round6(lng) });
      },
    }),
    [onPick],
  );

  const start = point ?? TAUNGGYI;

  return (
    <div className={`osm-map ${className ?? ''}`} role="region" aria-label={label}>
      <MapContainer
        center={[start.lat, start.lng]}
        zoom={point ? PLACE_ZOOM : CITY_ZOOM}
        className="osm-map-canvas"
        touchZoom
        // Inside a form the mouse wheel should scroll the page, not zoom the map.
        scrollWheelZoom={!onPick}
        attributionControl
      >
        <TileLayer
          url={OSM_TILES}
          attribution={OSM_ATTRIBUTION}
          maxZoom={19}
          eventHandlers={{
            tileerror: () => setTileErrors((count) => count + 1),
            tileload: () => setTilesLoaded(true),
          }}
        />
        <KeepSized />
        <FollowPoint point={point} />
        {onPick && <PickOnTap onPick={onPick} />}
        {point && (
          <Marker
            position={[point.lat, point.lng]}
            icon={pinIcon}
            draggable={!!onPick}
            eventHandlers={markerHandlers}
            keyboard={false}
          />
        )}
      </MapContainer>
      {offline && <p className="osm-map-offline">Map unavailable offline.</p>}
    </div>
  );
}
