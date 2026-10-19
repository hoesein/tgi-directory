import { api } from './api';
import {
  isTazaungdaingParticipantDetails,
  type ApiDirectoryCategory,
  type ApiDirectoryRecord,
  type ApiEvent,
  type ApiEventDay,
  type ApiEventParticipant,
  type ApiResponse,
  type DirectoryCategoryMeta,
  type DirectoryCategoryView,
  type DirectoryItem,
  type DirectoryPlace,
  type EventDayView,
  type EventRangeView,
  type Paged,
  type ParticipantProfileView,
  type TazaungdaingEvent,
} from '../types';

// ─── Data source switch (TGI-18) ────────────────────────────────────────────
// "static" reads the bundled city-data JSON; "api" reads the backend /api/v1.

export type DataSource = 'static' | 'api';
export const DATA_SOURCE: DataSource = import.meta.env.VITE_DATA_SOURCE === 'api' ? 'api' : 'static';
export const API_PAGE_SIZE = 100;

const PAGODA_FESTIVAL_PREFIX = 'ဖောင်တော်ဦးဘုရားပွဲ';
const PAGODA_FESTIVAL_TYPE_ORDER = ['ကြွချီ', 'နေ့ဆွမ်း', 'ညကျိန်း'];

export function isPagodaFestival(eventName: string): boolean {
  return eventName.startsWith(PAGODA_FESTIVAL_PREFIX);
}

/** "hotels.json" (old static URLs) and "hotels" both mean the hotels entity. */
export function toEntityCode(value: string): string {
  return value.replace(/\.json$/, '');
}

// ─── Static source (bundled public/data) ────────────────────────────────────

const DATA_BASE_URL = (import.meta.env.VITE_DATA_URL as string | undefined)?.replace(/\/$/, '') ?? '';

async function fetchJson<T>(file: string): Promise<T> {
  const base = DATA_BASE_URL || import.meta.env.BASE_URL.replace(/\/$/, '');
  const response = await fetch(`${base}/data/${file}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch ${file}: ${response.status}`);
  }
  return response.json() as Promise<T>;
}

function humanize(code: string): string {
  return code.replace(/_/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function fetchStaticCategories(): Promise<DirectoryCategoryMeta[]> {
  return fetchJson<DirectoryCategoryMeta[]>('categories.json');
}

export function fetchDirectoryFile(file: string): Promise<DirectoryItem[]> {
  return fetchJson<DirectoryItem[]>(file);
}

export function fetchTazaungdaingEvents(): Promise<TazaungdaingEvent[]> {
  return fetchJson<TazaungdaingEvent[]>('tazaungdaing.json');
}

/** Detail-page id for a static item: dir--<file>--<index> (deep-linkable). */
export function toStaticListingId(file: string, index: number): string {
  return `dir--${file}--${index}`;
}

export function parseStaticListingId(id: string): { file: string; index: number } | null {
  if (!id.startsWith('dir--')) return null;
  const rest = id.slice('dir--'.length);
  const sep = rest.lastIndexOf('--');
  if (sep < 0) return null;
  const index = Number(rest.slice(sep + 2));
  if (!Number.isInteger(index) || index < 0) return null;
  return { file: rest.slice(0, sep), index };
}

function parseLocation(value: string): { latitude: number | null; longitude: number | null } {
  const match = value.match(/^\s*(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)\s*$/);
  return match
    ? { latitude: Number(match[1]), longitude: Number(match[2]) }
    : { latitude: null, longitude: null };
}

export function staticItemToPlace(file: string, item: DirectoryItem, index: number): DirectoryPlace {
  return {
    id: toStaticListingId(file, index),
    entity: toEntityCode(file),
    name: item.name,
    description: null,
    address: item.address || item.location,
    phone: item.phone || null,
    rating: Number(item.rating) || null,
    userRating: null,
    imageUrl: item.images || null,
    imageUrls: item.images ? [item.images] : [],
    type: item.type,
    township: null,
    ...parseLocation(item.location),
    updatedAt: null,
  };
}

function staticCategoryToView(meta: DirectoryCategoryMeta, index: number): DirectoryCategoryView {
  return {
    id: toEntityCode(meta.file),
    title: meta.title,
    description: meta.description,
    count: meta.count,
    sortOrder: meta.sort_order ?? index,
    types: meta.types.map((code) => ({ code, name: humanize(code) })),
  };
}

function staticEventsToDays(events: TazaungdaingEvent[], date: string): EventDayView[] {
  return events
    .filter((event) => event.event_date === date)
    .map((event) => {
      // Keep each participant's original index: the old profile URL uses it.
      const withIndex = event.participants.map((participant, index) => ({ participant, index }));
      const pagoda = isPagodaFestival(event.name);
      const rank = (type: string) => {
        const order = PAGODA_FESTIVAL_TYPE_ORDER.indexOf(type);
        return order < 0 ? PAGODA_FESTIVAL_TYPE_ORDER.length : order;
      };
      withIndex.sort((a, b) =>
        pagoda
          ? rank(a.participant.type) - rank(b.participant.type)
          : a.participant.type.localeCompare(b.participant.type),
      );
      return {
        key: `${event.event_date}-${event.name}`,
        date: event.event_date,
        eventName: event.name,
        title: event.name,
        // The static file has no event date range.
        dayNumber: null,
        dayCount: null,
        entries: withIndex.map(({ participant, index }) => {
          const details = isTazaungdaingParticipantDetails(participant);
          return {
            key: `${participant.name}-${participant.type}-${index}`,
            name: participant.name,
            role: participant.type,
            ward: details ? participant.ward : null,
            href:
              details && !pagoda
                ? `/events/tazaungdaing/${encodeURIComponent(event.event_date)}/${index}`
                : null,
          };
        }),
      };
    });
}

// ─── API source (/api/v1) ───────────────────────────────────────────────────

function apiRecordToPlace(entity: string, record: ApiDirectoryRecord): DirectoryPlace {
  return {
    id: record.id,
    entity,
    name: record.name,
    description: record.description,
    address: record.address ?? '',
    phone: record.phone,
    rating: record.rating === null ? null : Number(record.rating),
    userRating: record.user_rating ?? null,
    imageUrl: record.image_urls?.[0] ?? null,
    imageUrls: record.image_urls ?? [],
    type: record.type ?? { code: '', name: '' },
    township: record.township ? { id: record.township.id, name: record.township.name } : null,
    latitude: record.latitude === null ? null : Number(record.latitude),
    longitude: record.longitude === null ? null : Number(record.longitude),
    updatedAt: record.updated_at ?? null,
  };
}

const DAY_MS = 24 * 60 * 60 * 1000;

/** Whole days from one YYYY-MM-DD date to another (UTC, so DST can't shift it). */
export function daysBetween(from: string, to: string): number {
  return Math.round((Date.parse(`${to}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`)) / DAY_MS);
}

function apiDayToView(day: ApiEventDay): EventDayView {
  const pagoda = isPagodaFestival(day.event.name);
  const dayCount = daysBetween(day.event.start_date, day.event.end_date) + 1;
  const dayNumber = daysBetween(day.event.start_date, day.event_date) + 1;
  const multiDay = dayCount > 1 && dayNumber >= 1 && dayNumber <= dayCount;
  return {
    key: day.id,
    date: day.event_date,
    eventName: day.event.name,
    title: day.title ?? day.event.name,
    dayNumber: multiDay ? dayNumber : null,
    dayCount: multiDay ? dayCount : null,
    entries: day.schedule
      .filter((row) => row.participant !== null)
      .map((row) => ({
        key: row.id,
        name: row.participant!.name,
        role: row.role?.name ?? '',
        ward: row.participant!.ward,
        href: pagoda
          ? null
          : `/events/participants/${row.participant!.id}?date=${encodeURIComponent(day.event_date)}`,
      })),
  };
}

// ─── Public fetchers (pick the source) ──────────────────────────────────────

export async function fetchDirectoryCategories(): Promise<DirectoryCategoryView[]> {
  if (DATA_SOURCE === 'api') {
    const response = await api.get<ApiResponse<ApiDirectoryCategory[]>>('/v1/directory-categories');
    return response.data.map((category) => ({
      id: category.code,
      title: category.title,
      description: category.description ?? '',
      count: category.count,
      sortOrder: category.sort_order,
      types: category.types,
    }));
  }
  const manifest = await fetchStaticCategories();
  return manifest
    .map(staticCategoryToView)
    .map((category, index) => ({ category, index }))
    .sort((a, b) => a.category.sortOrder - b.category.sortOrder || a.index - b.index)
    .map(({ category }) => category);
}

export type PlaceSort = 'name' | 'newest';

export interface PlaceFilters {
  search?: string;
  typeCode?: string | null;
  /** API mode only: static data has no township ids. */
  townshipId?: string | null;
  /** API mode only; static data keeps file order. */
  sort?: PlaceSort;
  pageSize?: number;
}

const SORT_PARAMS: Record<PlaceSort, { sort: string; direction: string }> = {
  name: { sort: 'name', direction: 'asc' },
  newest: { sort: 'created_at', direction: 'desc' },
};

export interface PlacePage {
  items: DirectoryPlace[];
  page: number;
  hasMore: boolean;
  total: number;
}

export async function fetchDirectoryPlaces(
  entity: string,
  filters: PlaceFilters,
  page: number,
): Promise<PlacePage> {
  const search = filters.search?.trim() ?? '';
  if (DATA_SOURCE === 'api') {
    const pageSize = filters.pageSize ?? API_PAGE_SIZE;
    const params: Record<string, string> = {
      page: String(page),
      page_size: String(pageSize),
      ...SORT_PARAMS[filters.sort ?? 'name'],
    };
    if (search) params.search = search;
    if (filters.typeCode) params.type_code = filters.typeCode;
    if (filters.townshipId) params.township_id = filters.townshipId;
    const response = await api.get<ApiResponse<Paged<ApiDirectoryRecord>>>(
      `/v1/directory/${encodeURIComponent(entity)}`,
      params,
    );
    const { items, total } = response.data;
    return {
      items: items.map((record) => apiRecordToPlace(entity, record)),
      page,
      hasMore: page * pageSize < total,
      total,
    };
  }

  const file = `${entity}.json`;
  const all = (await fetchDirectoryFile(file)).map((item, index) => staticItemToPlace(file, item, index));
  const query = search.toLowerCase();
  const items = all.filter(
    (place) =>
      (!filters.typeCode || place.type.code === filters.typeCode) &&
      (!query ||
        place.name.toLowerCase().includes(query) ||
        place.address.toLowerCase().includes(query)),
  );
  return { items, page: 1, hasMore: false, total: items.length };
}

/** A place by route id. Old static ids (dir--…) always read the bundled JSON. */
export async function fetchDirectoryPlace(entity: string, id: string): Promise<DirectoryPlace | null> {
  const staticRef = parseStaticListingId(id);
  if (staticRef) {
    const items = await fetchDirectoryFile(staticRef.file);
    const item = items[staticRef.index];
    return item ? staticItemToPlace(staticRef.file, item, staticRef.index) : null;
  }
  if (DATA_SOURCE !== 'api') return null;
  try {
    const response = await api.get<ApiResponse<ApiDirectoryRecord>>(
      `/v1/directory/${encodeURIComponent(entity)}/${encodeURIComponent(id)}`,
    );
    return apiRecordToPlace(entity, response.data);
  } catch (error) {
    if (error instanceof Error && /not found|invalid record id/i.test(error.message)) return null;
    throw error;
  }
}

export async function fetchEventDays(date: string, signal?: AbortSignal): Promise<EventDayView[]> {
  if (DATA_SOURCE === 'api') {
    const response = await api.get<ApiResponse<ApiEventDay[]>>('/v1/event-days', { date }, signal);
    return response.data.map(apiDayToView);
  }
  return staticEventsToDays(await fetchTazaungdaingEvents(), date);
}

export async function fetchEventParticipant(
  id: string,
  date: string | null,
): Promise<ParticipantProfileView | null> {
  let participant: ApiEventParticipant;
  try {
    const response = await api.get<ApiResponse<ApiEventParticipant>>(
      `/v1/event-participants/${encodeURIComponent(id)}`,
    );
    participant = response.data;
  } catch (error) {
    if (error instanceof Error && /not found|invalid participant id/i.test(error.message)) return null;
    throw error;
  }
  // The role of that day's appearance; otherwise the most recent one.
  const appearance =
    participant.appearances.find((item) => item.event_date === date) ??
    participant.appearances[participant.appearances.length - 1];
  return {
    name: participant.name,
    role: appearance?.role?.name ?? null,
    ward: participant.ward,
    leader: participant.leader,
    initialYear: participant.initial_year === null ? null : String(participant.initial_year),
    milestones: participant.milestones.map((milestone) => ({
      year: String(milestone.year),
      achieve: milestone.achieve,
    })),
    about: participant.about,
    social: participant.social,
    appearances: [...participant.appearances]
      .sort((a, b) => b.event_date.localeCompare(a.event_date))
      .map((item) => ({
        key: item.id,
        date: item.event_date,
        eventName: item.event?.name ?? '',
        dayTitle: item.day?.title ?? null,
        role: item.role?.name ?? null,
      })),
  };
}

/**
 * The static file has one entry per day, and a festival's name can change on
 * its last day. Consecutive days of the same festival become one range.
 */
function staticEventRanges(events: TazaungdaingEvent[]): EventRangeView[] {
  const ranges: EventRangeView[] = [];
  const sorted = [...events].sort((a, b) => a.event_date.localeCompare(b.event_date));
  for (const event of sorted) {
    const pagoda = isPagodaFestival(event.name);
    const last = ranges[ranges.length - 1];
    if (last && isPagodaFestival(last.name) === pagoda && daysBetween(last.endDate, event.event_date) === 1) {
      last.endDate = event.event_date;
      if (!pagoda) last.name = event.name;
      continue;
    }
    ranges.push({
      key: `${event.event_date}-${event.name}`,
      name: pagoda ? PAGODA_FESTIVAL_PREFIX : event.name,
      startDate: event.event_date,
      endDate: event.event_date,
    });
  }
  return ranges;
}

/** Every active event with its date range, sorted by start date. */
export async function fetchEventRanges(): Promise<EventRangeView[]> {
  if (DATA_SOURCE === 'api') {
    const response = await api.get<ApiResponse<ApiEvent[]>>('/v1/events', { page_size: '100' });
    return response.data
      .map((event) => ({ key: event.id, name: event.name, startDate: event.start_date, endDate: event.end_date }))
      .sort((a, b) => a.startDate.localeCompare(b.startDate));
  }
  return staticEventRanges(await fetchTazaungdaingEvents());
}
