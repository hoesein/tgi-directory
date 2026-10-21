import { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import BackButton from '../components/BackButton';
import LoadMore from '../components/LoadMore';
import PlaceCard from '../components/PlaceCard';
import { PhotoGridSkeleton } from '../components/Skeleton';
import { useDirectoryPlaces, useDirectoryTownships } from '../api/useDirectory';
import { PLACES_TO_VISIT, townshipLabel } from '../lib/routes';

const PAGE_SIZE = 10;

/** Every place to visit in one township, loaded as the user scrolls (TGI-61). */
export default function TownshipPlacesPage() {
  const { townshipId = 'none' } = useParams();
  const { data: townships } = useDirectoryTownships(PLACES_TO_VISIT);
  const query = useDirectoryPlaces(PLACES_TO_VISIT, { townshipId, pageSize: PAGE_SIZE });
  const places = useMemo(() => query.data?.pages.flatMap((page) => page.items) ?? [], [query.data]);
  const total = query.data?.pages[0]?.total;
  const township = townships?.find((item) => (item.id ?? 'none') === townshipId);
  // Before the township list arrives, the first loaded place names it.
  const title =
    townshipId === 'none'
      ? townshipLabel(null)
      : (township?.name ?? places[0]?.township?.name ?? 'Places to Visit');

  return (
    <div>
      <div className="page-head">
        <BackButton variant="header" />
        <h1>{title}</h1>
        <span style={{ width: 24 }} />
      </div>

      {query.isError && (
        <div className="data-error" role="alert">
          <span>Couldn’t load places.</span>
          <button className="link-btn" onClick={() => void query.refetch()} type="button">
            Retry
          </button>
        </div>
      )}

      {total != null && total > 0 && (
        <p className="list-count township-count">
          {total} {total === 1 ? 'place' : 'places'} to visit
        </p>
      )}

      {query.isLoading ? (
        <PhotoGridSkeleton />
      ) : (
        !query.isError && (
          <div className="places-grid">
            {places.map((place) => (
              <PlaceCard key={place.id} place={place} />
            ))}
            {places.length === 0 && <p className="empty places-grid-empty">No places to visit here yet.</p>}
          </div>
        )
      )}
      <LoadMore query={query} />
    </div>
  );
}
