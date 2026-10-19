import { Star } from 'lucide-react';
import type { UserRatingSummary } from '../types';

/** "★ 4.2 (12)" community rating; nothing when nobody has rated. */
export default function RatingSummary({ summary }: { summary: UserRatingSummary | null }) {
  if (!summary || summary.count === 0 || summary.average === null) return null;
  const ratings = summary.count === 1 ? 'rating' : 'ratings';
  return (
    <span
      className="rating-summary"
      aria-label={`Rated ${summary.average.toFixed(1)} out of 5 by ${summary.count} ${ratings}`}
    >
      <Star size={14} fill="currentColor" aria-hidden="true" />
      <span>{summary.average.toFixed(1)}</span>
      <span className="rating-summary-count">({summary.count})</span>
    </span>
  );
}
