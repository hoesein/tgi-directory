import { useEffect, useRef, useState } from 'react';
import { useDirectoryPlaces } from '../api/useDirectory';
import type { DirectoryPlace } from '../types';
import NearestCard from './NearestCard';

const FOOD_PLACES = 'food_places';
const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=400&h=400&fit=crop';

function selectRandomPlaces(items: DirectoryPlace[]): DirectoryPlace[] {
  const shuffled = [...items];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[randomIndex]] = [shuffled[randomIndex], shuffled[index]];
  }
  return shuffled.slice(0, 3);
}

interface NearestListingsProps {
  onViewAll: () => void;
  onListingPress: (place: DirectoryPlace) => void;
}

export default function NearestListings({ onViewAll, onListingPress }: NearestListingsProps) {
  // First page only: up to 100 food places in API mode, the whole file in static mode.
  const { data, isLoading, isError, refetch } = useDirectoryPlaces(FOOD_PLACES);
  const places = data?.pages[0]?.items;
  const [selected, setSelected] = useState<DirectoryPlace[] | null>(null);
  const hasSelected = useRef(false);

  useEffect(() => {
    if (places && !hasSelected.current) {
      hasSelected.current = true;
      setSelected(selectRandomPlaces(places));
    }
  }, [places]);

  return (
    <section className="section">
      <div className="section-head">
        <h2>Nearest Place</h2>
        <button className="link-btn" onClick={onViewAll} type="button">
          View All
        </button>
      </div>
      <div className="h-scroll">
        {isLoading && <p className="centered">Loading recommendations…</p>}
        {isError && (
          <div className="data-error" role="alert">
            <span>Couldn’t load food recommendations.</span>
            <button className="link-btn" onClick={() => void refetch()} type="button">
              Retry
            </button>
          </div>
        )}
        {!isLoading && !isError && places?.length === 0 && (
          <p className="empty">No food listings found.</p>
        )}
        {places && places.length > 0 && selected === null && (
          <p className="centered">Loading recommendations…</p>
        )}
        {selected?.map((place) => (
          <NearestCard
            key={place.id}
            listing={{
              id: place.id,
              name: place.name,
              address: place.address,
              type: place.type.name,
              image: place.imageUrl || FALLBACK_IMAGE,
            }}
            onPress={() => onListingPress(place)}
          />
        ))}
      </div>
    </section>
  );
}
