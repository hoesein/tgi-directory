import type { DirectoryPlace } from '../types';

/** The "Places to Visit" category is the bottom nav's Places tab. */
export const PLACES_TO_VISIT = 'places_to_visit';
export const PLACES_TAB_PATH = '/place-to-visit';

/** Places tab page for one township; 'none' lists places without a township. */
export function townshipPlacesPath(townshipId: string | null): string {
  return `${PLACES_TAB_PATH}/township/${encodeURIComponent(townshipId ?? 'none')}`;
}

/** Row and page title for a township; null is the group of places without one. */
export function townshipLabel(name: string | null): string {
  return name ?? 'Other places';
}

export function categoryPath(code: string): string {
  if (code.replace(/\.json$/, '') === PLACES_TO_VISIT) return PLACES_TAB_PATH;
  return `/category/${encodeURIComponent(code)}`;
}

/** Place detail route; works for UUIDs and static dir--… ids alike. */
export function placePath(place: Pick<DirectoryPlace, 'entity' | 'id'>): string {
  return `/place/${encodeURIComponent(place.entity)}/${encodeURIComponent(place.id)}`;
}
