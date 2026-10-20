import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Star } from 'lucide-react';
import BackButton from '../components/BackButton';
import { ListSkeleton } from '../components/Skeleton';
import PlaceImage from '../components/PlaceImage';
import { useMyRatings } from '../api/useRatings';
import { canSuggest } from '../services/suggestions';
import { useAuthStore } from '../store/authStore';
import { placePath } from '../lib/routes';
import type { ApiMyRatingItem } from '../types';

const dateFormat = new Intl.DateTimeFormat(undefined, { day: 'numeric', month: 'short', year: 'numeric' });

function Stars({ value }: { value: number }) {
  return (
    <span className="my-rating-stars" aria-label={`${value} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star key={n} size={14} fill={n <= value ? 'currentColor' : 'none'} className={n <= value ? 'on' : 'off'} />
      ))}
    </span>
  );
}

function RatingRow({ item }: { item: ApiMyRatingItem }) {
  const name = item.place?.name ?? 'Removed place';
  const listed = !!item.place?.is_active;
  const content = (
    <>
      <PlaceImage className="my-rating-thumb" src={item.place?.image_url} alt="" entity={item.entity} iconSize={22} />
      <div className="my-rating-text">
        <div className="my-rating-name">{name}</div>
        <div className="my-rating-meta">
          <Stars value={item.stars} />
          <span>{listed ? (item.place?.type?.name ?? '') : 'No longer listed'}</span>
        </div>
      </div>
      <time className="my-rating-date" dateTime={item.updated_at}>
        {dateFormat.format(new Date(item.updated_at))}
      </time>
    </>
  );
  return listed ? (
    <Link className="my-rating-row" to={placePath({ entity: item.entity, id: item.record_id })}>
      {content}
    </Link>
  ) : (
    <div className="my-rating-row muted">{content}</div>
  );
}

/** Profile → Places I rated (TGI-55). */
export default function MyRatingsPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const ready = useAuthStore((state) => state.ready);
  const { data, isLoading, isError, refetch } = useMyRatings(canSuggest());

  if (!canSuggest()) return <Navigate to="/profile" replace />;
  if (ready && !user) {
    return <Navigate to={`/sign-in?next=${encodeURIComponent(location.pathname)}`} replace />;
  }

  return (
    <div className="suggest-page">
      <div className="page-head">
        <BackButton onBack={() => navigate('/profile', { replace: true })} />
        <h1>Places I rated</h1>
        <span style={{ width: 24 }} />
      </div>

      <div className="my-rating-list">
        {isLoading && <ListSkeleton rows={4} />}
        {isError && (
          <div className="centered">
            <p role="alert">Couldn&apos;t load your ratings.</p>
            <button className="link-btn" type="button" onClick={() => void refetch()}>
              Retry
            </button>
          </div>
        )}
        {data?.items.length === 0 && (
          <p className="empty">
            You haven&apos;t rated any places yet. Open a hotel or food place and tap a star.
          </p>
        )}
        {data?.items.map((item) => <RatingRow key={`${item.entity}:${item.record_id}`} item={item} />)}
      </div>
    </div>
  );
}
