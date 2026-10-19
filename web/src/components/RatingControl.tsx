import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Star } from 'lucide-react';
import { useMyRating, useRatePlace } from '../api/useRatings';
import { ApiError } from '../services/api';
import { useAuthStore } from '../store/authStore';

const STARS = [1, 2, 3, 4, 5];

function errorMessage(error: unknown): string {
  if (error instanceof ApiError && error.status === 429) return 'Too many ratings. Try again later.';
  if (error instanceof ApiError && error.status === 401) return 'Please sign in again to rate.';
  return "Couldn't save your rating. Please try again.";
}

/** Tap-to-rate stars on a place page (TGI-23). Signed-out taps go to sign-in. */
export default function RatingControl({ entity, placeId }: { entity: string; placeId: string }) {
  const user = useAuthStore((state) => state.user);
  const navigate = useNavigate();
  const location = useLocation();
  const myRating = useMyRating(entity, placeId, !!user);
  const rate = useRatePlace(entity, placeId);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 3500);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const ownStars = user ? (myRating.data?.stars ?? null) : null;

  const choose = (stars: number | null) => {
    if (!user) {
      navigate(`/sign-in?next=${encodeURIComponent(location.pathname)}`);
      return;
    }
    if (stars === ownStars) return;
    rate.mutate(stars, { onError: (error) => setToast(errorMessage(error)) });
  };

  return (
    <section className="rating-control" aria-labelledby="rating-control-title">
      <h2 id="rating-control-title">{ownStars ? 'Your rating' : 'Rate this place'}</h2>
      <div className="rating-stars" role="group" aria-label="Your rating">
        {STARS.map((value) => {
          const filled = ownStars !== null && value <= ownStars;
          return (
            <button
              key={value}
              type="button"
              className={`rating-star${filled ? ' filled' : ''}`}
              onClick={() => choose(value)}
              disabled={!!user && myRating.isLoading}
              aria-label={`${value} star${value === 1 ? '' : 's'}`}
              aria-pressed={ownStars === value}
            >
              <Star size={30} fill={filled ? 'currentColor' : 'none'} />
            </button>
          );
        })}
      </div>
      {!user && <p className="rating-hint">Sign in to rate.</p>}
      {ownStars !== null && (
        <button type="button" className="link-btn rating-remove" onClick={() => choose(null)}>
          Remove my rating
        </button>
      )}
      {toast && (
        <div className="rating-toast" role="status">
          {toast}
        </div>
      )}
    </section>
  );
}
