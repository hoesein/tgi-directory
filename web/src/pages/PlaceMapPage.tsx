import { Link, useParams } from 'react-router-dom';
import { MapPin, Navigation, PencilLine, Search } from 'lucide-react';
import BackButton from '../components/BackButton';
import LazyOsmMap from '../components/map/LazyOsmMap';
import { useDirectoryPlace } from '../api/useDirectory';
import { addressSearchUrl, directionsUrl } from '../lib/maps';
import { placePath } from '../lib/routes';
import { canSuggest } from '../services/suggestions';
import { parseStaticListingId } from '../services/directory';

/** /place/:entity/:listingId/map — the place on OpenStreetMap, with directions. */
export default function PlaceMapPage() {
  const { entity, listingId = '' } = useParams();
  const { data: place, isLoading } = useDirectoryPlace(entity, decodeURIComponent(listingId));

  if (!place) {
    return <div className="centered">{isLoading ? <p>Loading…</p> : <p>Place not found</p>}</div>;
  }

  const point =
    place.latitude !== null && place.longitude !== null ? { lat: place.latitude, lng: place.longitude } : null;
  const suggestable = canSuggest() && !parseStaticListingId(place.id);

  return (
    <div className="map-page">
      <div className="page-head">
        <BackButton />
        <h1>{place.name}</h1>
        <span style={{ width: 24 }} />
      </div>

      <LazyOsmMap className="map-page-map" point={point} label={`Map of ${place.name}`} />

      <section className="map-sheet">
        {place.address && (
          <p className="map-sheet-address">
            <MapPin size={17} aria-hidden="true" />
            <span>{place.address}</span>
          </p>
        )}

        {point ? (
          <a className="btn-primary map-sheet-action" href={directionsUrl(point)} target="_blank" rel="noreferrer">
            <Navigation size={18} />
            <span>Directions</span>
          </a>
        ) : (
          <>
            <p className="map-sheet-note">The exact location hasn’t been added yet. The map shows Taunggyi.</p>
            <div className="map-sheet-buttons">
              {place.address && (
                <a className="chip-btn" href={addressSearchUrl(place.address)} target="_blank" rel="noreferrer">
                  <Search size={16} />
                  <span>Search address</span>
                </a>
              )}
              {suggestable && (
                <Link className="chip-btn" to={`${placePath(place)}/suggest`}>
                  <PencilLine size={16} />
                  <span>Add the location</span>
                </Link>
              )}
            </div>
          </>
        )}
      </section>
    </div>
  );
}
