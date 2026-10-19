import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Search } from 'lucide-react';
import CategoryListItem from '../components/CategoryListItem';
import BackButton from '../components/BackButton';
import { useDirectoryCategories, useDirectoryPlaces } from '../api/useDirectory';
import { toEntityCode } from '../services/directory';
import { placePath } from '../lib/routes';

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=400&h=400&fit=crop';
const SEARCH_DEBOUNCE_MS = 300;

export default function CategoryPage() {
  const { categoryId = '' } = useParams();
  // Old static URLs use the file name (/category/hotels.json).
  const entity = toEntityCode(categoryId);
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [activeTypeId, setActiveTypeId] = useState<string | null>(null);

  useEffect(() => {
    const timeout = window.setTimeout(() => setDebouncedSearch(searchQuery.trim()), SEARCH_DEBOUNCE_MS);
    return () => window.clearTimeout(timeout);
  }, [searchQuery]);

  const {
    data: categories,
    isError: categoriesError,
    refetch: retryCategories,
  } = useDirectoryCategories();
  const {
    data,
    isLoading,
    isError: placesError,
    refetch: retryPlaces,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useDirectoryPlaces(entity, { search: debouncedSearch, typeCode: activeTypeId });

  const category = useMemo(() => categories?.find((item) => item.id === entity), [categories, entity]);
  const places = useMemo(() => data?.pages.flatMap((page) => page.items) ?? [], [data]);

  const typeOptions = useMemo(
    () =>
      (category?.types ?? []).map((type) => ({
        id: type.code,
        // Static types only carry codes; prefer the label on a loaded record.
        name: places.find((place) => place.type.code === type.code)?.type.name ?? type.name,
      })),
    [category, places],
  );

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
            placeholder="Search..."
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

      <div className="chip-row">
        <button
          className={`chip${activeTypeId === null ? ' selected' : ''}`}
          onClick={() => setActiveTypeId(null)}
          type="button"
        >
          All
        </button>
        {typeOptions.map((t) => (
          <button
            key={t.id}
            className={`chip${activeTypeId === t.id ? ' selected' : ''}`}
            onClick={() => setActiveTypeId(t.id)}
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
        {places.map((place) => (
          <CategoryListItem
            key={place.id}
            item={{
              id: place.id,
              title: place.name,
              location: place.address,
              rating: place.rating ?? 0,
              reviews: 0,
              image: place.imageUrl || FALLBACK_IMAGE,
            }}
            onPress={() => navigate(placePath(place))}
          />
        ))}
        {isLoading && <p className="centered">Loading…</p>}
        {!isLoading && !placesError && places.length === 0 && <p className="empty">No listings found.</p>}
        {hasNextPage && (
          <button
            className="link-btn"
            style={{ display: 'block', margin: '12px auto' }}
            onClick={() => void fetchNextPage()}
            disabled={isFetchingNextPage}
            type="button"
          >
            {isFetchingNextPage ? 'Loading…' : 'Load more'}
          </button>
        )}
      </div>
    </div>
  );
}
