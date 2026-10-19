import type { DirectoryPlace } from '../types';

export function categoryPath(code: string): string {
  return `/category/${encodeURIComponent(code)}`;
}

/** Place detail route; works for UUIDs and static dir--… ids alike. */
export function placePath(place: Pick<DirectoryPlace, 'entity' | 'id'>): string {
  return `/place/${encodeURIComponent(place.entity)}/${encodeURIComponent(place.id)}`;
}
