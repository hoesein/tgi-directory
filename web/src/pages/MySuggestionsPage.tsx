import { useEffect, useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import BackButton from '../components/BackButton';
import { useDirectoryCategories } from '../api/useDirectory';
import { useMySuggestions, useWithdrawSuggestion } from '../api/useSuggestions';
import {
  canSuggest,
  SUGGESTION_KIND_LABELS,
  SUGGESTION_STATE_LABELS,
  suggestionErrorMessage,
} from '../services/suggestions';
import { useAuthStore } from '../store/authStore';
import type { ApiSuggestion } from '../types';

function placeLink(suggestion: ApiSuggestion): string | null {
  const id = suggestion.record_id ?? (suggestion.state === 'approved' ? suggestion.applied_record_id : null);
  return id ? `/place/${suggestion.entity}/${id}` : null;
}

/** The signed-in user's suggestions and their review state (TGI-24). */
export default function MySuggestionsPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const ready = useAuthStore((state) => state.ready);
  const { data: suggestions, isLoading, isError, refetch } = useMySuggestions();
  const { data: categories } = useDirectoryCategories();
  const withdraw = useWithdrawSuggestion();
  const [toast, setToast] = useState<string | null>(
    (location.state as { toast?: string } | null)?.toast ?? null,
  );

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 4000);
    return () => window.clearTimeout(timer);
  }, [toast]);

  if (!canSuggest()) return <Navigate to="/profile" replace />;
  if (ready && !user) {
    return <Navigate to={`/sign-in?next=${encodeURIComponent(location.pathname)}`} replace />;
  }

  const categoryTitle = (entity: string) => categories?.find((item) => item.id === entity)?.title ?? entity;

  return (
    <div className="suggest-page">
      <div className="page-head">
        <BackButton onBack={() => navigate('/profile', { replace: true })} />
        <h1>My suggestions</h1>
        <span style={{ width: 24 }} />
      </div>

      <div className="suggestion-list">
        {isLoading && <p className="centered">Loading…</p>}
        {isError && (
          <div className="centered">
            <p role="alert">Couldn&apos;t load your suggestions.</p>
            <button className="link-btn" type="button" onClick={() => void refetch()}>
              Retry
            </button>
          </div>
        )}
        {suggestions?.length === 0 && (
          <p className="empty">
            No suggestions yet. Use &quot;Suggest an edit&quot; on a place, or &quot;Add a missing place&quot; in a
            category.
          </p>
        )}
        {suggestions?.map((suggestion) => {
          const link = placeLink(suggestion);
          const title = suggestion.kind === 'new_place' ? `New: ${suggestion.place_name}` : suggestion.place_name;
          return (
            <article key={suggestion.id} className="suggestion-card">
              <div className="suggestion-card-head">
                <h2>{link ? <Link to={link}>{title}</Link> : title}</h2>
                <span className={`state-badge state-${suggestion.state}`}>
                  {SUGGESTION_STATE_LABELS[suggestion.state]}
                </span>
              </div>
              <p className="suggestion-meta">
                {SUGGESTION_KIND_LABELS[suggestion.kind]} · {categoryTitle(suggestion.entity)} ·{' '}
                {new Date(suggestion.created_at).toLocaleDateString()}
              </p>
              {suggestion.state === 'rejected' && suggestion.reason && (
                <p className="suggestion-reason">Reason: {suggestion.reason}</p>
              )}
              {suggestion.state === 'pending' && (
                <button
                  type="button"
                  className="link-btn"
                  disabled={withdraw.isPending}
                  onClick={() =>
                    withdraw.mutate(suggestion.id, {
                      onSuccess: () => setToast('Suggestion withdrawn.'),
                      onError: (error) => setToast(suggestionErrorMessage(error)),
                    })
                  }
                >
                  Withdraw
                </button>
              )}
            </article>
          );
        })}
      </div>

      {toast && (
        <div className="rating-toast" role="status">
          {toast}
        </div>
      )}
    </div>
  );
}
