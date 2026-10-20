import { keepPreviousData, useInfiniteQuery, useQuery } from '@tanstack/react-query';
import {
  DATA_SOURCE,
  fetchDirectoryCategories,
  fetchDirectoryPlace,
  fetchDirectoryPlaces,
  fetchEventDays,
  fetchEventParticipant,
  fetchEventRanges,
  fetchHomeSlides,
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
    queryKey: [
      'directory-places',
      DATA_SOURCE,
      entity,
      filters.search ?? '',
      filters.typeCode ?? null,
      filters.townshipId ?? null,
      filters.sort ?? 'name',
      filters.pageSize ?? null,
    ],
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
    // The signal cancels the request when the user has already moved to another day.
    queryFn: ({ signal }) => fetchEventDays(date, signal),
    // Keep showing the last day while the next one loads, instead of an empty page.
    placeholderData: keepPreviousData,
    staleTime: STALE_TIME,
  });
}

/** All events with their date ranges (calendar dots, upcoming list). */
export function useEventRanges() {
  return useQuery({
    queryKey: ['event-ranges', DATA_SOURCE],
    queryFn: fetchEventRanges,
    staleTime: STALE_TIME,
  });
}

/** Home slider photos picked in the admin portal (TGI-60). */
export function useHomeSlides() {
  return useQuery({
    queryKey: ['home-slides', DATA_SOURCE],
    queryFn: fetchHomeSlides,
    staleTime: STALE_TIME,
    retry: 1,
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
