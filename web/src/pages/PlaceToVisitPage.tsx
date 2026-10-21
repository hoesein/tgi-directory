import { Link } from 'react-router-dom';
import { ChevronRight, PlusCircle } from 'lucide-react';
import LoadMore from '../components/LoadMore';
import PlaceCard from '../components/PlaceCard';
import { CardRowSkeleton } from '../components/Skeleton';
import { useDirectoryCategories, useDirectoryPlaces, useDirectoryTownships } from '../api/useDirectory';
import { DATA_SOURCE } from '../services/directory';
import { canSuggest } from '../services/suggestions';
import { PLACES_TO_VISIT, townshipLabel, townshipPlacesPath } from '../lib/routes';
import type { ApiTownshipCount } from '../types';

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

/** Places per row request; the row loads the next batch as it nears its end. */
const ROW_PAGE_SIZE = 10;

/**
 * The Places tab, which is also the "Places to Visit" category (TGI-47).
 * API mode shows one swipeable row per township (TGI-61); tapping the
 * township name opens all of its places.
 */
export default function PlaceToVisitPage() {
  const apiMode = DATA_SOURCE === 'api';
  const { data: categories } = useDirectoryCategories();
  const townships = useDirectoryTownships(apiMode ? PLACES_TO_VISIT : undefined);
  const category = categories?.find((item) => item.id === PLACES_TO_VISIT);
  const rows = townships.data ?? [];
  const loading = apiMode && townships.isLoading;

  return (
    <div>
      <div className="page-head">
        <h1>{category?.title ?? 'Places to Visit'}</h1>
        <span style={{ width: 24 }} />
      </div>

      {apiMode && townships.isError && (
        <div className="data-error" role="alert">
          <span>Couldn’t load places.</span>
          <button className="link-btn" onClick={() => void townships.refetch()} type="button">
            Retry
          </button>
        </div>
      )}

      {loading && (
        <div className="township-section">
          <CardRowSkeleton />
        </div>
      )}

      {rows.length > 0
        ? rows.map((township) => <TownshipRow key={township.id ?? 'none'} township={township} />)
        : !loading &&
          !townships.isError && (
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
          )}

      {apiMode && canSuggest() && !loading && (
        <Link className="suggest-entry" to={`/category/${PLACES_TO_VISIT}/add`}>
          <PlusCircle size={18} />
          <span>Know a place worth visiting? Add it</span>
        </Link>
      )}
    </div>
  );
}

function TownshipRow({ township }: { township: ApiTownshipCount }) {
  const query = useDirectoryPlaces(PLACES_TO_VISIT, {
    townshipId: township.id ?? 'none',
    pageSize: ROW_PAGE_SIZE,
  });
  const places = query.data?.pages.flatMap((page) => page.items) ?? [];
  const label = townshipLabel(township.name);
  const path = townshipPlacesPath(township.id);

  return (
    <section className="township-section" aria-label={label}>
      <div className="section-head">
        <Link className="township-title" to={path}>
          <h2>{label}</h2>
          <ChevronRight size={20} aria-hidden="true" />
        </Link>
        <Link className="link-btn" to={path} aria-label={`View All ${township.count} places in ${label}`}>
          View All
        </Link>
      </div>
      {query.isLoading ? (
        <CardRowSkeleton />
      ) : query.isError ? (
        <div className="data-error" role="alert">
          <span>Couldn’t load {label}.</span>
          <button className="link-btn" onClick={() => void query.refetch()} type="button">
            Retry
          </button>
        </div>
      ) : (
        <div className="h-scroll township-row">
          {places.map((place) => (
            <PlaceCard key={place.id} place={place} />
          ))}
          <LoadMore query={query} axis="x" />
        </div>
      )}
    </section>
  );
}
