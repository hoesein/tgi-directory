import { useNavigate } from 'react-router-dom';
import BackButton from '../components/BackButton';
import CategoryIcon from '../components/CategoryIcon';
import { useDirectoryCategories } from '../api/useDirectory';
import { categoryPath } from '../lib/routes';

export default function CategoriesPage() {
  const navigate = useNavigate();
  const { data: categories, error, isLoading, refetch } = useDirectoryCategories();

  return (
    <div>
      <div className="page-head">
        <BackButton variant="header" />
        <h1>All Categories</h1>
        <span style={{ width: 24 }} />
      </div>

      <div className="directory-categories">
        {isLoading && <p className="centered">Loading categories…</p>}
        {error && (
          <div className="centered">
            <p>Unable to load categories.</p>
            <button className="link-btn" onClick={() => void refetch()} type="button">
              Try again
            </button>
          </div>
        )}
        {categories?.map((category) => (
          <button
            key={category.id}
            className="directory-category"
            onClick={() => navigate(categoryPath(category.id))}
            type="button"
          >
            <span className="cat-icon" aria-hidden>
              <CategoryIcon
                id={category.id}
                icon={category.types[0]?.code}
                name={category.title}
              />
            </span>
            <span className="directory-category-copy">
              <strong>{category.title}</strong>
              <span>{category.description}</span>
            </span>
            <span className="directory-category-count">{category.count}</span>
          </button>
        ))}
        {!isLoading && !error && categories?.length === 0 && (
          <p className="empty">No categories found.</p>
        )}
      </div>
    </div>
  );
}
