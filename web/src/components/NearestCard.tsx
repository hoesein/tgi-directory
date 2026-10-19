import PlaceImage from './PlaceImage';
import type { DirectoryPlace } from '../types';

interface NearestCardProps {
  place: DirectoryPlace;
  onPress: () => void;
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
        </div>
      </div>
    </button>
  );
}
