import { Star } from 'lucide-react';
import PlaceImage from './PlaceImage';
import type { DirectoryPlace } from '../types';

interface NearestCardProps {
  place: DirectoryPlace;
  onPress: () => void;
}

/** "★ 4.2 (12)" from community ratings, else "★ 4.5" from the editor's rating. */
function CardRating({ place }: { place: DirectoryPlace }) {
  const community = place.userRating && place.userRating.count > 0 ? place.userRating : null;
  const score = community?.average ?? place.rating;
  if (score === null || score === undefined) return null;
  return (
    <span className="nearest-rating" aria-label={`Rated ${score.toFixed(1)} out of 5`}>
      <Star size={12} fill="currentColor" aria-hidden="true" />
      {score.toFixed(1)}
      {community && <span className="nearest-rating-count">({community.count})</span>}
    </span>
  );
}

export default function NearestCard({ place, onPress }: NearestCardProps) {
  return (
    <button className="nearest-card" onClick={onPress} type="button">
      <PlaceImage className="nearest-card-image" src={place.imageUrl} alt={place.name} entity={place.entity} />
      <div className="nearest-body">
        <h3>{place.name}</h3>
        <p>{place.address}</p>
        <div className="nearest-meta">
          <span>{place.type.name.replace(/_/g, ' ')}</span>
          <CardRating place={place} />
        </div>
      </div>
    </button>
  );
}
