import { Link } from 'react-router-dom';
import PlaceImage from './PlaceImage';
import { placePath } from '../lib/routes';
import type { DirectoryPlace } from '../types';

/** Photo card for a place (Places tab rows and grids). */
export default function PlaceCard({ place, className = '' }: { place: DirectoryPlace; className?: string }) {
  return (
    <Link className={`place-card place-card-link ${className}`.trim()} to={placePath(place)}>
      <PlaceImage className="place-card-image" src={place.imageUrl} alt={place.name} entity={place.entity} />
      <div className="place-info">
        <div className="place-name">{place.name}</div>
        <div className="place-location">{place.type.name || place.township?.name}</div>
      </div>
    </Link>
  );
}
