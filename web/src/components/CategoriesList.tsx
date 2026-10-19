import CategoryCard from './CategoryCard';
import { useDirectoryCategories } from '../api/useDirectory';

interface CategoriesListProps {
  onViewAll: () => void;
  onCategoryPress: (id: string) => void;
}

export default function CategoriesList({ onViewAll, onCategoryPress }: CategoriesListProps) {
  const { data: categories, isLoading, isError, refetch } = useDirectoryCategories();

  return (
    <section className="section">
      <div className="section-head">
        <h2>Categories</h2>
        <button className="link-btn" onClick={onViewAll} type="button">
          View All
        </button>
      </div>
      {isError && (
        <div className="data-error" role="alert">
          <span>Couldn’t load directory categories.</span>
          <button className="link-btn" onClick={() => void refetch()} type="button">
            Retry
          </button>
        </div>
      )}
      {isLoading ? (
        <div className="spinner">Loading…</div>
      ) : (
        <div className="cat-grid">
          {categories?.map((category) => (
            <div key={category.id} className="cat-cell">
              <CategoryCard
                category={{
                  id: category.id,
                  name: category.title,
                  icon: category.types[0]?.code ?? 'apps-outline',
                }}
                onPress={() => onCategoryPress(category.id)}
              />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
