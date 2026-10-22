import type { ApiResponse, ApiSuggestion, ApiTownship, Paged, SuggestionInput } from '../types';
import { api, ApiError } from './api';
import { DATA_SOURCE } from './directory';

/** Suggestions need the backend's record ids, so only API mode offers them. */
export function canSuggest(): boolean {
  return DATA_SOURCE === 'api';
}

export async function fetchTownships(): Promise<ApiTownship[]> {
  const response = await api.get<ApiResponse<ApiTownship[]>>('/v1/townships');
  return response.data;
}

export async function submitSuggestion(input: SuggestionInput): Promise<ApiSuggestion> {
  const response = await api.post<ApiResponse<ApiSuggestion>>('/v1/suggestions', input);
  return response.data;
}

export async function fetchMySuggestions(): Promise<ApiSuggestion[]> {
  const response = await api.getMine<ApiResponse<Paged<ApiSuggestion> | ApiSuggestion[]>>('/v1/suggestions', {
    page: '1',
    page_size: '100',
  });
  // Paged since TGI-67; a bare array is the older backend.
  return Array.isArray(response.data) ? response.data : response.data.items;
}

export async function withdrawSuggestion(id: string): Promise<ApiSuggestion> {
  const response = await api.post<ApiResponse<ApiSuggestion>>(
    `/v1/suggestions/${encodeURIComponent(id)}/withdraw`,
  );
  return response.data;
}

/** Friendly text for a failed submit. */
export function suggestionErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.code === 'duplicate_pending') return 'You already have a pending suggestion for this place.';
    if (error.status === 429) return 'You have too many pending suggestions. Wait until some are reviewed.';
    if (error.status === 401) return 'Please sign in again.';
    if (error.status === 404) return 'This place is no longer listed.';
    if (error.status === 400) return error.message;
  }
  return "Couldn't send your suggestion. Please try again.";
}

export const SUGGESTION_KIND_LABELS = {
  correction: 'Correction',
  new_place: 'New place',
  closed: 'Closed',
} as const;

export const SUGGESTION_STATE_LABELS = {
  pending: 'Waiting for review',
  approved: 'Approved',
  rejected: 'Not approved',
  withdrawn: 'Withdrawn',
} as const;
