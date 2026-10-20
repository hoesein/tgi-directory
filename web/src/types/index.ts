export interface ApiResponse<T> {
  success: boolean;
  data: T;
  count?: number;
}

// ─── Static directory data (aggregated_data/ hosted on GitHub) ─────────────

export interface DirectoryItem {
  name: string;
  phone: string;
  address: string;
  location: string;
  images: string;
  rating: string;
  type: {
    code: string;
    name: string;
  };
  source_file: string;
}

export interface DirectoryCategoryMeta {
  file: string;
  title: string;
  description: string;
  count: number;
  sort_order?: number;
  types: string[];
}

export interface TazaungdaingEvent {
  event_date: string;
  name: string;
  participants: (TazaungdaingParticipantDetails | PagodaFestivalParticipant)[];
}

export interface TazaungdaingParticipant {
  name: string;
  type: string;
}

export type PagodaFestivalParticipant = TazaungdaingParticipant;

export interface TazaungdaingParticipantDetails extends TazaungdaingParticipant {
  ward: string;
  leader: string;
  about: string;
  initial_year: string;
  milestones: {
    year: string;
    achieve: string;
  }[];
  social?: TazaungdaingParticipantSocial[] | null;
}

export interface TazaungdaingParticipantSocial {
  platform: string;
  url: string;
}

export function isTazaungdaingParticipantDetails(
  participant: TazaungdaingParticipantDetails | PagodaFestivalParticipant,
): participant is TazaungdaingParticipantDetails {
  return 'milestones' in participant;
}

// ─── Backend /api/v1 responses (TGI-18) ─────────────────────────────────────

export interface Paged<T> {
  items: T[];
  page: number;
  page_size: number;
  total: number;
}

export interface ApiDirectoryCategory {
  code: string;
  title: string;
  description: string | null;
  sort_order: number;
  count: number;
  types: { code: string; name: string }[];
}

export interface ApiDirectoryRecord {
  id: string;
  name: string;
  description: string | null;
  phone: string | null;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  rating: number | null;
  images: string[];
  image_urls?: string[];
  type: { code: string; name: string } | null;
  township: { id: string; code: string; name: string; region_code: string } | null;
  created_at?: string;
  updated_at?: string;
  /** Community rating; only hotels and food places have it. */
  user_rating?: UserRatingSummary;
}

/** Community star rating. `average` is null when nobody has rated yet. */
export interface UserRatingSummary {
  average: number | null;
  count: number;
}

export interface ApiMyRating {
  entity: string;
  record_id: string;
  /** The signed-in user's own stars, or null when not rated. */
  stars: number | null;
  user_rating: UserRatingSummary;
}

/** One row of GET /v1/ratings/mine. `place` is null when the record no longer exists. */
/** GET /v1/home-slides (TGI-60): an admin-picked place photo for the Home slider. */
export interface ApiHomeSlide {
  id: string;
  title: string;
  subtitle: string | null;
  image_url: string;
  entity: string;
  record_id: string;
}

export interface ApiMyRatingItem {
  entity: string;
  record_id: string;
  stars: number;
  updated_at: string;
  place: {
    name: string;
    is_active: boolean;
    type: { code: string; name: string } | null;
    image_url: string | null;
  } | null;
}

export interface ApiTownship {
  id: string;
  code: string;
  name: string;
  region_code: string;
}

export type SuggestionKind = 'correction' | 'new_place' | 'closed';
export type SuggestionState = 'pending' | 'approved' | 'rejected' | 'withdrawn';

/** Fields a suggestion can set (backend names). */
export interface SuggestionChanges {
  name?: string;
  description?: string | null;
  phone?: string | null;
  address?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  township_id?: string;
  type_code?: string;
}

export type SuggestionInput =
  | { kind: 'correction'; entity: string; record_id: string; changes: SuggestionChanges; note?: string }
  | { kind: 'closed'; entity: string; record_id: string; note?: string }
  | { kind: 'new_place'; entity: string; changes: SuggestionChanges; note?: string };

export interface ApiSuggestion {
  id: string;
  kind: SuggestionKind;
  entity: string;
  record_id: string | null;
  place_name: string;
  changes: SuggestionChanges;
  note: string | null;
  state: SuggestionState;
  reason: string | null;
  applied_record_id: string | null;
  created_at: string;
  reviewed_at: string | null;
}

export interface ApiEventDay {
  id: string;
  event_date: string;
  title: string | null;
  event: { id: string; name: string; start_date: string; end_date: string };
  schedule: {
    id: string;
    sort_order: number;
    participant: { id: string; name: string; ward: string | null } | null;
    role: { id: string; name: string } | null;
  }[];
}

export interface ApiEventParticipant {
  id: string;
  name: string;
  ward: string | null;
  leader: string | null;
  about: string | null;
  initial_year: number | null;
  milestones: { year: string | number; achieve: string }[];
  social: { platform: string; url: string }[];
  appearances: {
    id: string;
    event_date: string;
    day: { id: string; title: string | null } | null;
    event: { id: string; name: string } | null;
    role: { id: string; name: string } | null;
  }[];
}

// ─── View models shared by the static and API data sources ─────────────────

export interface DirectoryCategoryView {
  /** Entity code, e.g. "hotels". Also the /category/:code route param. */
  id: string;
  title: string;
  description: string;
  count: number;
  sortOrder: number;
  types: { code: string; name: string }[];
}

export interface DirectoryPlace {
  /** Record UUID (api) or dir--<file>--<index> (static). */
  id: string;
  entity: string;
  name: string;
  description: string | null;
  address: string;
  phone: string | null;
  /** Editorial rating from the data source. */
  rating: number | null;
  /** Community rating (API mode, hotels and food places); null otherwise. */
  userRating: UserRatingSummary | null;
  /** Cover image: the first of imageUrls. */
  imageUrl: string | null;
  /** Every photo in display order (API records can have up to 10). */
  imageUrls: string[];
  type: { code: string; name: string };
  /** API mode only; static data has no township ids. */
  township: { id: string; name: string } | null;
  latitude: number | null;
  longitude: number | null;
  /** Last change (API mode); null for static data. */
  updatedAt: string | null;
}

export interface EventEntryView {
  key: string;
  name: string;
  role: string;
  ward: string | null;
  /** Participant profile link, or null when there is no profile to show. */
  href: string | null;
}

/** GET /v1/events row (fields the app uses). */
export interface ApiEvent {
  id: string;
  name: string;
  start_date: string;
  end_date: string;
}

/** One event and the dates it runs, for calendar dots and the upcoming list. */
export interface EventRangeView {
  key: string;
  name: string;
  startDate: string;
  endDate: string;
}

export interface EventDayView {
  key: string;
  date: string;
  eventName: string;
  title: string;
  /** Position within a multi-day event (API mode); null when unknown or single-day. */
  dayNumber: number | null;
  dayCount: number | null;
  entries: EventEntryView[];
}

export interface ParticipantAppearanceView {
  key: string;
  date: string;
  eventName: string;
  dayTitle: string | null;
  role: string | null;
}

export interface ParticipantProfileView {
  name: string;
  role: string | null;
  ward: string | null;
  leader: string | null;
  initialYear: string | null;
  milestones: { year: string; achieve: string }[];
  about: string | null;
  social: { platform: string; url: string }[];
  /** Every scheduled appearance, newest first (API mode; empty for static data). */
  appearances: ParticipantAppearanceView[];
}
