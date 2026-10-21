import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { PlusCircle, Search } from 'lucide-react';
import { canSuggest } from '../services/suggestions';
import CategoryListItem from '../components/CategoryListItem';
import BackButton from '../components/BackButton';
import LoadMore from '../components/LoadMore';
import { ListSkeleton } from '../components/Skeleton';
import { useDirectoryCategories, useDirectoryPlaces } from '../api/useDirectory';
import { useTownships } from '../api/useSuggestions';
import { DATA_SOURCE, toEntityCode, type PlaceSort } from '../services/directory';
import { placePath } from '../lib/routes';

const SEARCH_DEBOUNCE_MS = 300;
const SORT_OPTIONS: { value: PlaceSort; label: string }[] = [
  { value: 'name', label: 'Name A–Z' },
  { value: 'newest', label: 'Newest first' },
];

function isPlaceSort(value: string | null): value is PlaceSort {
  return SORT_OPTIONS.some((option) => option.value === value);
}

export default function CategoryPage() {
  const { categoryId = '' } = useParams();
  // Old static URLs use the file name (/category/hotels.json).
  const entity = toEntityCode(categoryId);
  const navigate = useNavigate();
  const apiMode = DATA_SOURCE === 'api';

  // Filters live in the URL so back navigation and shared links keep them.
  const [searchParams, setSearchParams] = useSearchParams();
  const urlSearch = searchParams.get('q') ?? '';
  const activeTypeId = searchParams.get('type');
  const townshipId = apiMode ? searchParams.get('township') : null;
  const sortParam = searchParams.get('sort');
  const sort: PlaceSort = apiMode && isPlaceSort(sortParam) ? sortParam : 'name';

  const [searchQuery, setSearchQuery] = useState(urlSearch);

  const setParam = (key: string, value: string | null) => {
    setSearchParams(
      (current) => {
        const next = new URLSearchParams(current);
        if (value) next.set(key, value);
        else next.delete(key);
        return next;
      },
      { replace: true },
    );
  };

  useEffect(() => {
    const trimmed = searchQuery.trim();
    if (trimmed === urlSearch) return;
    const timeout = window.setTimeout(() => setParam('q', trimmed || null), SEARCH_DEBOUNCE_MS);
    return () => window.clearTimeout(timeout);
  }, [searchQuery, urlSearch]);

  const {
    data: categories,
    isError: categoriesError,
    refetch: retryCategories,
  } = useDirectoryCategories();
  const { data: townships } = useTownships(apiMode);
  const {
    data,
    isLoading,
    isError: placesError,
    refetch: retryPlaces,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isFetchNextPageError,
  } = useDirectoryPlaces(entity, { search: urlSearch, typeCode: activeTypeId, townshipId, sort });

  const category = useMemo(() => categories?.find((item) => item.id === entity), [categories, entity]);
  const places = useMemo(() => data?.pages.flatMap((page) => page.items) ?? [], [data]);
  const total = data?.pages[0]?.total;

  const typeOptions = useMemo(
    () =>
      (category?.types ?? []).map((type) => ({
        id: type.code,
        // Static types only carry codes; prefer the label on a loaded record.
        name: places.find((place) => place.type.code === type.code)?.type.name ?? type.name,
      })),
    [category, places],
  );

  const filtered = !!(urlSearch || activeTypeId || townshipId);
  // With a single township (today: only Taunggyi) the row label is noise; the filter stays for new townships.
  const showTownships = (townships?.length ?? 0) > 1;

  return (
    <div>
      <div className="page-head">
        <BackButton variant="header" />
        <h1>{category?.title ?? 'Category'}</h1>
        <span style={{ width: 24 }} />
      </div>

      <div style={{ padding: '12px 16px 0' }}>
        <div className="searchbar">
          <Search size={18} color="#999" />
          <input
            placeholder="Search by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            type="search"
            aria-label="Search places"
          />
          {searchQuery.length > 0 && (
            <button className="icon-btn" onClick={() => setSearchQuery('')} aria-label="Clear" type="button">
              ×
            </button>
          )}
        </div>
      </div>

      {apiMode && (
        <div className="filter-row">
          <label className="filter-select">
            <span className="visually-hidden">Township</span>
            <select value={townshipId ?? ''} onChange={(e) => setParam('township', e.target.value || null)}>
              <option value="">All townships</option>
              {(townships ?? []).map((township) => (
                <option key={township.id} value={township.id}>
                  {township.name}
                </option>
              ))}
            </select>
          </label>
          <label className="filter-select">
            <span className="visually-hidden">Sort</span>
            <select
              value={sort}
              onChange={(e) => setParam('sort', e.target.value === 'name' ? null : e.target.value)}
            >
              {SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>
      )}

      <div className="chip-row">
        <button
          className={`chip${activeTypeId === null ? ' selected' : ''}`}
          onClick={() => setParam('type', null)}
          type="button"
        >
          All
        </button>
        {typeOptions.map((t) => (
          <button
            key={t.id}
            className={`chip${activeTypeId === t.id ? ' selected' : ''}`}
            onClick={() => setParam('type', t.id)}
            type="button"
          >
            {t.name}
          </button>
        ))}
      </div>

      {(categoriesError || placesError) && (
        <div className="data-error" role="alert">
          <span>Couldn’t load this directory data.</span>
          <button
            className="link-btn"
            onClick={() => {
              if (categoriesError) void retryCategories();
              if (placesError) void retryPlaces();
            }}
            type="button"
          >
            Retry
          </button>
        </div>
      )}

      <div className="list">
        {total != null && !isLoading && places.length > 0 && (
          <p className="list-count">
            {total} {total === 1 ? 'place' : 'places'}
            {filtered ? ' match' : ''}
          </p>
        )}
        {places.map((place) => (
          <CategoryListItem
            key={place.id}
            place={place}
            showTownship={showTownships}
            onPress={() => navigate(placePath(place))}
          />
        ))}
        {isLoading && <ListSkeleton />}
        {!isLoading && !placesError && places.length === 0 && (
          <div className="empty">
            <p>No places found.</p>
            {filtered && (
              <button
                className="link-btn"
                onClick={() => {
                  setSearchQuery('');
                  setSearchParams(sort === 'name' ? {} : { sort }, { replace: true });
                }}
                type="button"
              >
                Clear filters
              </button>
            )}
          </div>
        )}
        {/* Loads the next 100 as the end of the list scrolls near (TGI-61). */}
        <LoadMore query={{ hasNextPage, isFetchingNextPage, isFetchNextPageError, fetchNextPage }} />
        {canSuggest() && !isLoading && (
          <Link className="suggest-entry" to={`/category/${categoryId}/add`}>
            <PlusCircle size={18} />
            <span>Can&apos;t find a place? Add it</span>
          </Link>
        )}
      </div>
    </div>
  );
}
