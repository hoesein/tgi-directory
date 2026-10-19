export interface LatLng {
  lat: number;
  lng: number;
}

/** Taunggyi city centre: the default map view when a place has no location. */
export const TAUNGGYI: LatLng = { lat: 20.7836, lng: 97.0354 };
export const CITY_ZOOM = 14;
export const PLACE_ZOOM = 17;

export const OSM_TILES = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
export const OSM_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a>';

export function round6(value: number): number {
  return Number(value.toFixed(6));
}

export function isAppleDevice(): boolean {
  if (typeof navigator === 'undefined') return false;
  // iPadOS reports itself as a Mac with touch.
  return /iPhone|iPad|iPod/.test(navigator.userAgent) || (/Macintosh/.test(navigator.userAgent) && navigator.maxTouchPoints > 1);
}

/** Turn-by-turn directions in the phone's own maps app. */
export function directionsUrl(point: LatLng): string {
  return isAppleDevice()
    ? `https://maps.apple.com/?daddr=${point.lat},${point.lng}`
    : `https://www.google.com/maps/dir/?api=1&destination=${point.lat},${point.lng}`;
}

/** Text search in Google Maps, for places that have an address but no pin yet. */
export function addressSearchUrl(address: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
}
