import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import {
  DATA_SOURCE,
  fetchDirectoryCategories,
  fetchDirectoryPlace,
  fetchDirectoryPlaces,
  fetchEventDays,
  fetchEventParticipant,
  fetchTazaungdaingEvents,
  type PlaceFilters,
} from '../services/directory';

const HOUR = 1000 * 60 * 60;
// Static files change only on deploy; API data changes with admin edits.
const STALE_TIME = DATA_SOURCE === 'api' ? 1000 * 60 * 5 : HOUR;

/** Category summary (title, description, count, types). */
export function useDirectoryCategories() {
  return useQuery({
    queryKey: ['directory-categories', DATA_SOURCE],
    queryFn: fetchDirectoryCategories,
    staleTime: STALE_TIME,
  });
}

/** Places in one category, filtered; API mode pages 100 at a time. */
export function useDirectoryPlaces(entity: string | undefined, filters: PlaceFilters = {}) {
  return useInfiniteQuery({
    queryKey: ['directory-places', DATA_SOURCE, entity, filters.search ?? '', filters.typeCode ?? null],
    queryFn: ({ pageParam }) => fetchDirectoryPlaces(entity as string, filters, pageParam),
    initialPageParam: 1,
    getNextPageParam: (last) => (last.hasMore ? last.page + 1 : undefined),
    enabled: !!entity,
    staleTime: STALE_TIME,
  });
}

/** One place by entity and route id (UUID, or an old dir--… static id). */
export function useDirectoryPlace(entity: string | undefined, id: string | undefined) {
  return useQuery({
    queryKey: ['directory-place', DATA_SOURCE, entity, id],
    queryFn: () => fetchDirectoryPlace(entity as string, id as string),
    enabled: !!entity && !!id,
    staleTime: STALE_TIME,
  });
}

/** Event days on one date with their ordered schedules. */
export function useEventDays(date: string) {
  return useQuery({
    queryKey: ['event-days', DATA_SOURCE, date],
    queryFn: () => fetchEventDays(date),
    staleTime: STALE_TIME,
  });
}

/** Participant profile (API mode). */
export function useEventParticipant(id: string | undefined, date: string | null) {
  return useQuery({
    queryKey: ['event-participant', id, date],
    queryFn: () => fetchEventParticipant(id as string, date),
    enabled: !!id,
    staleTime: STALE_TIME,
  });
}

/** Bundled tazaungdaing.json, for old /events/tazaungdaing/:date/:index links. */
export function useTazaungdaingEvents() {
  return useQuery({
    queryKey: ['tazaungdaing-events'],
    queryFn: fetchTazaungdaingEvents,
    staleTime: HOUR,
  });
}
