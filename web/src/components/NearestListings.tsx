import { useMemo, useRef } from 'react';
import { useDirectoryPlaces } from '../api/useDirectory';
import type { DirectoryPlace } from '../types';
import NearestCard from './NearestCard';
import { CardRowSkeleton } from './Skeleton';

/** Rateable categories feed the row; most places have no coordinates yet (TGI-48). */
const HOTELS = 'hotels';
const FOOD_PLACES = 'food_places';
const ROW_SIZE = 6;

/** Community average when someone rated it, else the editor's rating. */
function placeScore(place: DirectoryPlace): number | null {
  if (place.userRating && place.userRating.count > 0 && place.userRating.average !== null) {
    return place.userRating.average;
  }
  return place.rating;
}

function shuffle<T>(items: T[]): T[] {
  const shuffled = [...items];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[randomIndex]] = [shuffled[randomIndex], shuffled[index]];
  }
  return shuffled;
}

/** Best rated first (more ratings wins a tie), then random unrated places to fill the row. */
function pickTopPlaces(places: DirectoryPlace[], size = ROW_SIZE): DirectoryPlace[] {
  const rated = places
    .filter((place) => placeScore(place) !== null)
    .sort(
      (a, b) =>
        (placeScore(b) ?? 0) - (placeScore(a) ?? 0) ||
        (b.userRating?.count ?? 0) - (a.userRating?.count ?? 0)
    );
  const top = rated.slice(0, size);
  const unrated = shuffle(places.filter((place) => placeScore(place) === null));
  return [...top, ...unrated.slice(0, size - top.length)];
}

interface NearestListingsProps {
  onViewAll: () => void;
  onListingPress: (place: DirectoryPlace) => void;
}

export default function NearestListings({ onViewAll, onListingPress }: NearestListingsProps) {
  // First page of each: up to 100 places in API mode, the whole file in static mode.
  const hotels = useDirectoryPlaces(HOTELS);
  const food = useDirectoryPlaces(FOOD_PLACES);
  const isLoading = hotels.isLoading || food.isLoading;
  const isError = hotels.isError && food.isError;
  const hotelItems = hotels.data?.pages[0]?.items;
  const foodItems = food.data?.pages[0]?.items;

  // Pick once per visit so the random fill doesn't reshuffle on every refetch.
  const picked = useRef<DirectoryPlace[] | null>(null);
  const places = useMemo(() => {
    if (picked.current) return picked.current;
    if (isLoading || (!hotelItems && !foodItems)) return null;
    picked.current = pickTopPlaces([...(hotelItems ?? []), ...(foodItems ?? [])]);
    return picked.current;
  }, [isLoading, hotelItems, foodItems]);

  return (
    <section className="section">
      <div className="section-head">
        <h2>Top picks</h2>
        <button className="link-btn" onClick={onViewAll} type="button">
          View All
        </button>
      </div>
      <div className="h-scroll">
        {isLoading && <CardRowSkeleton />}
        {isError && (
          <div className="data-error" role="alert">
            <span>Couldn’t load recommendations.</span>
            <button
              className="link-btn"
              onClick={() => {
                void hotels.refetch();
                void food.refetch();
              }}
              type="button"
            >
              Retry
            </button>
          </div>
        )}
        {places?.length === 0 && <p className="empty">No places found.</p>}
        {places?.map((place) => (
          <NearestCard key={`${place.entity}:${place.id}`} place={place} onPress={() => onListingPress(place)} />
        ))}
      </div>
    </section>
  );
}
