import type { ApiMyRating, ApiMyRatingItem, ApiResponse, Paged } from '../types';
import { api } from './api';
import { DATA_SOURCE } from './directory';

/** Categories users can rate (TGI-20). Matches the backend's RATEABLE_ENTITIES. */
const RATEABLE_ENTITIES = new Set(['hotels', 'food_places']);

/** Ratings need the backend's record ids, so only API mode can rate. */
export function canRate(entity: string | undefined): boolean {
  return DATA_SOURCE === 'api' && !!entity && RATEABLE_ENTITIES.has(entity);
}

function ratingPath(entity: string, id: string): string {
  return `/v1/directory/${encodeURIComponent(entity)}/${encodeURIComponent(id)}/rating`;
}

export async function fetchMyRating(entity: string, id: string): Promise<ApiMyRating> {
  const response = await api.getMine<ApiResponse<ApiMyRating>>(ratingPath(entity, id));
  return response.data;
}

export async function saveRating(entity: string, id: string, stars: number): Promise<ApiMyRating> {
  const response = await api.put<ApiResponse<ApiMyRating>>(ratingPath(entity, id), { stars });
  return response.data;
}

export async function removeRating(entity: string, id: string): Promise<void> {
  await api.delete<void>(ratingPath(entity, id));
}

/** The signed-in user's ratings, newest first. */
export async function fetchMyRatings(): Promise<{ items: ApiMyRatingItem[]; count: number }> {
  const response = await api.getMine<ApiResponse<Paged<ApiMyRatingItem> | ApiMyRatingItem[]>>('/v1/ratings/mine', {
    page_size: '100',
  });
  // Paged since TGI-67; a bare array is the older backend.
  const items = Array.isArray(response.data) ? response.data : response.data.items;
  return { items, count: response.count ?? items.length };
}
