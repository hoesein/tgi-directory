import { useEffect, useRef, useState } from 'react';
import { toStaticListingId, useDirectoryFile } from '../api/useDirectory';
import type { DirectoryItem } from '../types';
import NearestCard from './NearestCard';

interface SelectedListing {
  item: DirectoryItem;
  index: number;
}

const FOOD_PLACES_FILE = 'food_places.json';
const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=400&h=400&fit=crop';

function selectRandomListings(items: DirectoryItem[]): SelectedListing[] {
  const shuffled = items.map((item, index) => ({ item, index }));

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[randomIndex]] = [shuffled[randomIndex], shuffled[index]];
  }

  return shuffled.slice(0, 3);
}

interface NearestListingsProps {
  onViewAll: () => void;
  onListingPress: (id: string) => void;
}

export default function NearestListings({ onViewAll, onListingPress }: NearestListingsProps) {
  const { data: listings, isLoading, isError, refetch } = useDirectoryFile(FOOD_PLACES_FILE);
  const [selectedListings, setSelectedListings] = useState<SelectedListing[] | null>(null);
  const hasSelectedListings = useRef(false);

  useEffect(() => {
    if (listings && !hasSelectedListings.current) {
      hasSelectedListings.current = true;
      setSelectedListings(selectRandomListings(listings));
    }
  }, [listings]);

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
        {!isLoading && !isError && listings?.length === 0 && (
          <p className="empty">No food listings found.</p>
        )}
        {listings && listings.length > 0 && selectedListings === null && (
          <p className="centered">Loading recommendations…</p>
        )}
        {selectedListings?.map(({ item, index }) => {
          const id = toStaticListingId(FOOD_PLACES_FILE, index);
          return (
            <NearestCard
              key={id}
              listing={{
                id,
                name: item.name,
                address: item.address || item.location,
                type: item.type.name,
                image: item.images || FALLBACK_IMAGE,
              }}
              onPress={() => onListingPress(id)}
            />
          );
        })}
      </div>
    </section>
  );
}
