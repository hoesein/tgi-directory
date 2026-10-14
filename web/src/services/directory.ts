import type { DirectoryCategoryMeta, DirectoryItem, TazaungdaingEvent } from '../types';

const DATA_BASE_URL = (import.meta.env.VITE_DATA_URL as string | undefined)?.replace(/\/$/, '') ?? '';

export function isDirectoryDataConfigured(): boolean {
  // The checked-out submodule is the default source in development and production.
  return true;
}

async function fetchJson<T>(file: string): Promise<T> {
  const base = import.meta.env.DEV ? '/public' : DATA_BASE_URL || '/public';
  const response = await fetch(`${base}/data/${file}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch ${file}: ${response.status}`);
  }
  return response.json() as Promise<T>;
}

export function fetchDirectoryCategories(): Promise<DirectoryCategoryMeta[]> {
  return fetchJson<DirectoryCategoryMeta[]>('categories.json').then((categories) =>
    categories
      .map((category, index) => ({ category, index }))
      .sort(
        (a, b) =>
          (a.category.sort_order ?? a.index) - (b.category.sort_order ?? b.index) ||
          a.index - b.index,
      )
      .map(({ category }) => category),
  );
}

export function fetchDirectoryFile(file: string): Promise<DirectoryItem[]> {
  return fetchJson<DirectoryItem[]>(file);
}

export function fetchTazaungdaingEvents(): Promise<TazaungdaingEvent[]> {
  return fetchJson<TazaungdaingEvent[]>('tazaungdaing.json');
}
