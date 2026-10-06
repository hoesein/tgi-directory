import CategoryIcon from './CategoryIcon';

interface CategoryCardProps {
  category: {
    id: string;
    name: string;
    icon: string;
  };
  onPress?: () => void;
}

export default function CategoryCard({ category, onPress }: CategoryCardProps) {
  return (
    <button className="cat-card" onClick={onPress} type="button">
      <span className="cat-icon" aria-hidden>
        <CategoryIcon id={category.id} icon={category.icon} name={category.name} />
      </span>
      <span className="cat-label">{category.name}</span>
    </button>
  );
}
