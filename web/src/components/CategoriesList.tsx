import CategoryCard from './CategoryCard';
import { useMainCategories } from '../api/useCategories';
import { useDirectoryAsCategories } from '../api/useDirectory';
import { isDirectoryDataConfigured } from '../services/directory';

interface CategoriesListProps {
  onViewAll: () => void;
  onCategoryPress: (id: string) => void;
}

const FALLBACK_CATEGORIES = [
  { id: 'fallback-hotel', name: 'Hotel', icon: 'bed-outline', level: 0, parent_id: null, sort_order: 1 },
  { id: 'fallback-restaurant', name: 'Restaurant', icon: 'restaurant-outline', level: 0, parent_id: null, sort_order: 2 },
  { id: 'fallback-emergency', name: 'Emergency', icon: 'warning-outline', level: 0, parent_id: null, sort_order: 3 },
  { id: 'fallback-hospital', name: 'Hospital/Clinic', icon: 'medkit-outline', level: 0, parent_id: null, sort_order: 4 },
] as const;

export default function CategoriesList({ onViewAll, onCategoryPress }: CategoriesListProps) {
  // Prefer static JSON (local /data or GitHub) — no backend call, no 500s.
  const staticOn = isDirectoryDataConfigured();
  const {
    data: staticData,
    isLoading: staticLoading,
    isError: staticError,
    refetch: retryStatic,
  } = useDirectoryAsCategories();
  const { data: apiData, isLoading: apiLoading } = useMainCategories(!staticOn);

  const data = staticOn ? staticData : apiData;
  const isLoading = staticOn ? staticLoading : apiLoading;
  const categories = data && data.length > 0 ? data : FALLBACK_CATEGORIES;

  return (
    <section className="section">
      <div className="section-head">
        <h2>Categories</h2>
        <button className="link-btn" onClick={onViewAll} type="button">
          View All
        </button>
      </div>
      {staticOn && staticError && (
        <div className="data-error" role="alert">
          <span>Couldn’t load directory categories.</span>
          <button className="link-btn" onClick={() => void retryStatic()} type="button">
            Retry
          </button>
        </div>
      )}
      {isLoading && !data ? (
        <div className="spinner">Loading…</div>
      ) : (
        <div className="cat-grid">
          {categories.map((category) => (
            <div key={category.id} className="cat-cell">
              <CategoryCard
                category={{ id: category.id, name: category.name, icon: category.icon ?? 'apps-outline' }}
                onPress={() => onCategoryPress(category.id)}
              />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
