import { MapPin } from 'lucide-react';
import PlaceImage from './PlaceImage';
import RatingSummary from './RatingSummary';
import type { DirectoryPlace } from '../types';

interface CategoryListItemProps {
  place: DirectoryPlace;
  /** Show the township next to the type; off while every place shares one township. */
  showTownship?: boolean;
  onPress: () => void;
}

export default function CategoryListItem({ place, showTownship = false, onPress }: CategoryListItemProps) {
  const meta = [place.type.name, showTownship ? place.township?.name : null].filter(Boolean).join(' · ');

  return (
    <button className="list-item" onClick={onPress} type="button">
      <PlaceImage className="list-item-image" src={place.imageUrl} alt={place.name} entity={place.entity} />
      <div className="list-item-body">
        <h3>{place.name}</h3>
        {meta && <p className="list-item-meta">{meta}</p>}
        {place.address && (
          <p className="list-item-address">
            <MapPin size={13} aria-hidden="true" />
            <span>{place.address}</span>
          </p>
        )}
        {place.userRating?.count ? <RatingSummary summary={place.userRating} /> : null}
      </div>
    </button>
  );
}
