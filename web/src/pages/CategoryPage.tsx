import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Search } from 'lucide-react';
import CategoryListItem from '../components/CategoryListItem';
import BackButton from '../components/BackButton';
import {
  toStaticListingId,
  useDirectoryCategories,
  useDirectoryFile,
} from '../api/useDirectory';

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=400&h=400&fit=crop';

export default function CategoryPage() {
  const { categoryId = '' } = useParams();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTypeId, setActiveTypeId] = useState<string | null>(null);

  const {
    data: manifest,
    isError: manifestError,
    refetch: retryManifest,
  } = useDirectoryCategories();
  const {
    data: staticItems,
    isError: itemsError,
    refetch: retryItems,
  } = useDirectoryFile(categoryId);
  const staticMeta = useMemo(
    () => manifest?.find((m) => m.file === categoryId),
    [manifest, categoryId],
  );

  const typeOptions = useMemo(() => {
    return (staticMeta?.types ?? []).map((code) => ({
      id: code,
      name: staticItems?.find((item) => item.type.code === code)?.type.name ?? code,
    }));
  }, [staticItems, staticMeta]);

  const displayListings = useMemo(() => {
    const withIndex = (staticItems ?? []).map((item, index) => ({
      id: toStaticListingId(categoryId, index),
      title: item.name,
      location: item.address || item.location,
      rating: Number(item.rating) || 0,
      reviews: 0,
      image: item.images || FALLBACK_IMAGE,
      rawType: item.type.code,
    }));
    const byType = activeTypeId ? withIndex.filter((l) => l.rawType === activeTypeId) : withIndex;
    if (!searchQuery.trim()) return byType;
    const q = searchQuery.toLowerCase();
    return byType.filter(
      (l) => l.title.toLowerCase().includes(q) || l.location.toLowerCase().includes(q),
    );
  }, [searchQuery, staticItems, categoryId, activeTypeId]);

  const title = staticMeta?.title ?? 'Category';

  const handleTypeSelect = (id: string | null) => {
    setActiveTypeId(id);
  };

  return (
    <div>
      <div className="page-head">
        <BackButton variant="header" />
        <h1>{title}</h1>
        <span style={{ width: 24 }} />
      </div>

      <div style={{ padding: '12px 16px 0' }}>
        <div className="searchbar">
          <Search size={18} color="#999" />
          <input
            placeholder="Search by type..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            type="search"
            aria-label="Search by type"
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
          onClick={() => handleTypeSelect(null)}
          type="button"
        >
          All
        </button>
        {typeOptions.map((t) => (
          <button
            key={t.id}
            className={`chip${activeTypeId === t.id ? ' selected' : ''}`}
            onClick={() => handleTypeSelect(t.id)}
            type="button"
          >
            {t.name}
          </button>
        ))}
      </div>

      {(manifestError || itemsError) && (
        <div className="data-error" role="alert">
          <span>Couldn’t load this directory data.</span>
          <button
            className="link-btn"
            onClick={() => {
              if (manifestError) void retryManifest();
              if (itemsError) void retryItems();
            }}
            type="button"
          >
            Retry
          </button>
        </div>
      )}

      <div className="list">
        {displayListings.map((item) => (
          <CategoryListItem
            key={item.id}
            item={item}
            onPress={() => navigate(`/category-detail/${encodeURIComponent(item.id)}`)}
          />
        ))}
        {displayListings.length === 0 && <p className="empty">No listings found.</p>}</div>
    </div>
  );
}
