import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const registerSchema = z
  .object({
    name: z.string().min(2, 'Name is required'),
    email: z.string().email('Invalid email'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;

export interface Listing {
  id: string;
  title: string;
  description: string;
  category_id: string;
  category?: Category | null;
  user?: User | null;
  location: string;
  phone?: string | null;
  email?: string | null;
  website?: string | null;
  image?: string | null;
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
  description?: string | null;
  parent_id: string | null;
  icon?: string | null;
  level: number;
  sort_order: number;
  created_at: string;
  children?: Category[];
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
}

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
  rating: number | null;
  imageUrl: string | null;
  type: { code: string; name: string };
  latitude: number | null;
  longitude: number | null;
}

export interface EventEntryView {
  key: string;
  name: string;
  role: string;
  ward: string | null;
  /** Participant profile link, or null when there is no profile to show. */
  href: string | null;
}

export interface EventDayView {
  key: string;
  date: string;
  eventName: string;
  title: string;
  entries: EventEntryView[];
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
}
