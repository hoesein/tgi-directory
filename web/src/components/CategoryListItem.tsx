import RatingSummary from './RatingSummary';
import type { UserRatingSummary } from '../types';

interface CategoryListItemProps {
  item: {
    id: string;
    title: string;
    location: string;
    /** Community rating; hidden when nobody has rated. */
    userRating: UserRatingSummary | null;
    image: string;
  };
  onPress: () => void;
}

export default function CategoryListItem({ item, onPress }: CategoryListItemProps) {
  return (
    <button className="list-item" onClick={onPress} type="button">
      <img src={item.image} alt={item.title} loading="lazy" />
      <div>
        <h3>{item.title}</h3>
        <p>{item.location}</p>
        {item.userRating?.count ? (
          <p>
            <RatingSummary summary={item.userRating} />
          </p>
        ) : null}
      </div>
    </button>
  );
}
