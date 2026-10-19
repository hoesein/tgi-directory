import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useQueries } from '@tanstack/react-query';
import { Search } from 'lucide-react';
import BackButton from '../components/BackButton';
import CategoryListItem from '../components/CategoryListItem';
import { useDirectoryCategories } from '../api/useDirectory';
import { DATA_SOURCE, fetchDirectoryPlaces } from '../services/directory';
import { categoryPath, placePath } from '../lib/routes';

const MIN_LENGTH = 2;
const PER_CATEGORY = 5;
const SEARCH_DEBOUNCE_MS = 300;

/** /search?q= — name search across every category, grouped by category. */
export default function SearchPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const query = (searchParams.get('q') ?? '').trim();
  const [input, setInput] = useState(query);

  useEffect(() => {
    const trimmed = input.trim();
    if (trimmed === query) return;
    const timeout = window.setTimeout(
      () => setSearchParams(trimmed ? { q: trimmed } : {}, { replace: true }),
      SEARCH_DEBOUNCE_MS,
    );
    return () => window.clearTimeout(timeout);
  }, [input, query, setSearchParams]);

  const { data: categories, isLoading: categoriesLoading } = useDirectoryCategories();
  const ready = query.length >= MIN_LENGTH;
  const searchable = (categories ?? []).filter((category) => category.count > 0);

  const results = useQueries({
    queries: searchable.map((category) => ({
      queryKey: ['directory-search', DATA_SOURCE, category.id, query],
      queryFn: () => fetchDirectoryPlaces(category.id, { search: query, pageSize: PER_CATEGORY }, 1),
      enabled: ready,
      staleTime: 1000 * 60 * 5,
    })),
  });

  const groups = searchable
    .map((category, index) => ({ category, result: results[index] }))
    .filter(({ result }) => (result?.data?.total ?? 0) > 0);
  const loading = categoriesLoading || (ready && results.some((result) => result.isLoading));
  const failed = results.some((result) => result.isError);

  return (
    <div>
      <div className="page-head">
        <BackButton variant="header" />
        <h1>Search</h1>
        <span style={{ width: 24 }} />
      </div>

      <div style={{ padding: '12px 16px 0' }}>
        <div className="searchbar">
          <Search size={18} color="#999" />
          <input
            placeholder="Search places by name..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            type="search"
            aria-label="Search all places"
            autoFocus={!query}
          />
          {input.length > 0 && (
            <button className="icon-btn" onClick={() => setInput('')} aria-label="Clear" type="button">
              ×
            </button>
          )}
        </div>
      </div>

      <div className="list">
        {!ready && <p className="empty">Type at least {MIN_LENGTH} letters to search every category.</p>}
        {ready && loading && <p className="centered">Searching…</p>}
        {ready && failed && (
          <div className="data-error" role="alert">
            <span>Some categories couldn’t be searched.</span>
            <button
              className="link-btn"
              onClick={() => results.forEach((result) => result.isError && void result.refetch())}
              type="button"
            >
              Retry
            </button>
          </div>
        )}
        {ready && !loading && !failed && groups.length === 0 && (
          <p className="empty">No places match “{query}”.</p>
        )}

        {groups.map(({ category, result }) => {
          const page = result.data!;
          // Static mode returns every match; show the first few like the API does.
          const items = page.items.slice(0, PER_CATEGORY);
          return (
            <section key={category.id} className="search-group">
              <div className="section-head">
                <h2>
                  {category.title} <span className="search-group-count">{page.total}</span>
                </h2>
                {page.total > items.length && (
                  <Link className="link-btn" to={`${categoryPath(category.id)}?q=${encodeURIComponent(query)}`}>
                    See all
                  </Link>
                )}
              </div>
              {items.map((place) => (
                <CategoryListItem key={place.id} place={place} onPress={() => navigate(placePath(place))} />
              ))}
            </section>
          );
        })}
      </div>
    </div>
  );
}
