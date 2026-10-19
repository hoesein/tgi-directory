import type { DirectoryPlace } from '../types';

/** The "Places to Visit" category is the bottom nav's Places tab. */
export const PLACES_TO_VISIT = 'places_to_visit';
export const PLACES_TAB_PATH = '/place-to-visit';

export function categoryPath(code: string): string {
  if (code.replace(/\.json$/, '') === PLACES_TO_VISIT) return PLACES_TAB_PATH;
  return `/category/${encodeURIComponent(code)}`;
}

/** Place detail route; works for UUIDs and static dir--… ids alike. */
export function placePath(place: Pick<DirectoryPlace, 'entity' | 'id'>): string {
  return `/place/${encodeURIComponent(place.entity)}/${encodeURIComponent(place.id)}`;
}
