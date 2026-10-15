import { useQuery } from '@tanstack/react-query';
import {
  fetchDirectoryCategories,
  fetchDirectoryFile,
  fetchTazaungdaingEvents,
  isDirectoryDataConfigured,
} from '../services/directory';
import type { Category } from '../types';

/** Static manifest from aggregated_data/categories.json on GitHub. */
export function useDirectoryCategories() {
  return useQuery({
    queryKey: ['directory-categories'],
    queryFn: fetchDirectoryCategories,
    enabled: isDirectoryDataConfigured(),
    staleTime: 1000 * 60 * 60,
  });
}

/** One consolidated static file, e.g. "hotels.json". */
export function useDirectoryFile(file: string | undefined, type?: string) {
  return useQuery({
    queryKey: ['directory-file', file, type],
    queryFn: async () => {
      const items = await fetchDirectoryFile(file as string);
      return type ? items.filter((item) => item.type.code === type) : items;
    },
    enabled: isDirectoryDataConfigured() && !!file,
    staleTime: 1000 * 60 * 60,
  });
}

export function useTazaungdaingEvents() {
  return useQuery({
    queryKey: ['tazaungdaing-events'],
    queryFn: fetchTazaungdaingEvents,
    enabled: isDirectoryDataConfigured(),
    staleTime: 1000 * 60 * 60,
  });
}

/**
 * Static manifest adapted to the backend Category shape so category UI
 * works without any backend call. Static ids are the filenames
 * (e.g. "hotels.json").
 */
export function useDirectoryAsCategories() {
  return useQuery({
    queryKey: ['directory-as-categories'],
    queryFn: async () => {
      const manifest = await fetchDirectoryCategories();
      return manifest.map(
        (m, i): Category => ({
          id: m.file,
          name: m.title,
          description: m.description,
          parent_id: null,
          icon: m.types[0] ?? null,
          level: 0,
          sort_order: i,
          created_at: new Date(0).toISOString(),
          children: [],
        }),
      );
    },
    enabled: isDirectoryDataConfigured(),
    staleTime: 1000 * 60 * 60,
  });
}

/** Detail-page id for a static item: dir--<file>--<index> (deep-linkable). */
export function parseStaticListingId(id: string): { file: string; index: number } | null {
  if (!id.startsWith('dir--')) return null;
  const rest = id.slice('dir--'.length);
  const sep = rest.lastIndexOf('--');
  if (sep < 0) return null;
  const index = Number(rest.slice(sep + 2));
  if (!Number.isInteger(index) || index < 0) return null;
  return { file: rest.slice(0, sep), index };
}

export function toStaticListingId(file: string, index: number): string {
  return `dir--${file}--${index}`;
}
