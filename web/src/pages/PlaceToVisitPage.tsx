import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { PlusCircle } from 'lucide-react';
import PlaceImage from '../components/PlaceImage';
import { useDirectoryCategories, useDirectoryPlaces } from '../api/useDirectory';
import { DATA_SOURCE } from '../services/directory';
import { canSuggest } from '../services/suggestions';
import { PLACES_TO_VISIT, placePath } from '../lib/routes';

/** Shown until the directory has its own Places to Visit records (and always in static mode). */
const HIGHLIGHTS = [
  {
    id: 1,
    name: 'Shan State Cultural Museum',
    location: 'Taunggyi',
    image: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?w=400&h=300&fit=crop',
  },
  {
    id: 2,
    name: 'Inle Lake Viewpoint',
    location: 'Nyaungshwe',
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop',
  },
  {
    id: 3,
    name: 'Kakku Pagodas',
    location: 'Pa-O Tracts',
    image: 'https://images.unsplash.com/photo-1548013146-72479768bada?w=400&h=300&fit=crop',
  },
  {
    id: 4,
    name: 'Pindaya Caves',
    location: 'Pindaya',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop',
  },
];

/**
 * The Places tab, which is also the "Places to Visit" category (TGI-47).
 * API mode lists the directory's places_to_visit records with type chips.
 */
export default function PlaceToVisitPage() {
  const apiMode = DATA_SOURCE === 'api';
  const [typeCode, setTypeCode] = useState<string | null>(null);
  const { data: categories } = useDirectoryCategories();
  const { data, isLoading, isError, refetch } = useDirectoryPlaces(apiMode ? PLACES_TO_VISIT : undefined, {
    typeCode,
  });

  const category = categories?.find((item) => item.id === PLACES_TO_VISIT);
  const places = useMemo(() => data?.pages.flatMap((page) => page.items) ?? [], [data]);
  const hasRecords = apiMode && (category?.count ?? places.length) > 0;

  return (
    <div>
      <div className="page-head">
        <h1>{category?.title ?? 'Places to Visit'}</h1>
        <span style={{ width: 24 }} />
      </div>

      {hasRecords && (category?.types.length ?? 0) > 1 && (
        <div className="chip-row">
          <button
            className={`chip${typeCode === null ? ' selected' : ''}`}
            onClick={() => setTypeCode(null)}
            type="button"
          >
            All
          </button>
          {category!.types.map((type) => (
            <button
              key={type.code}
              className={`chip${typeCode === type.code ? ' selected' : ''}`}
              onClick={() => setTypeCode(type.code)}
              type="button"
            >
              {type.name}
            </button>
          ))}
        </div>
      )}

      {apiMode && isError && (
        <div className="data-error" role="alert">
          <span>Couldn’t load places.</span>
          <button className="link-btn" onClick={() => void refetch()} type="button">
            Retry
          </button>
        </div>
      )}

      {apiMode && isLoading && <p className="centered">Loading…</p>}

      {hasRecords ? (
        <div className="places-grid">
          {places.map((place) => (
            <Link key={place.id} className="place-card place-card-link" to={placePath(place)}>
              <PlaceImage className="place-card-image" src={place.imageUrl} alt={place.name} entity={place.entity} />
              <div className="place-info">
                <div className="place-name">{place.name}</div>
                <div className="place-location">{place.type.name || place.township?.name}</div>
              </div>
            </Link>
          ))}
          {!isLoading && places.length === 0 && <p className="empty places-grid-empty">No places of this type yet.</p>}
        </div>
      ) : (
        !isLoading && (
          <div className="places-grid">
            {HIGHLIGHTS.map((place) => (
              <div key={place.id} className="place-card">
                <img src={place.image} alt={place.name} />
                <div className="place-info">
                  <div className="place-name">{place.name}</div>
                  <div className="place-location">{place.location}</div>
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {apiMode && canSuggest() && !isLoading && (
        <Link className="suggest-entry" to={`/category/${PLACES_TO_VISIT}/add`}>
          <PlusCircle size={18} />
          <span>Know a place worth visiting? Add it</span>
        </Link>
      )}
    </div>
  );
}
