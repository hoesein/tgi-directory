import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { nextPathAfterSignIn } from '../lib/auth';
import { useAuthStore } from '../store/authStore';

const TIMEOUT_MS = 15000;

/** Read the provider's error, if any (query for PKCE, hash for older flows). */
function providerError(): string | null {
  const query = new URLSearchParams(window.location.search);
  const hash = new URLSearchParams(window.location.hash.replace(/^#/, ''));
  return query.get('error') ?? hash.get('error');
}

/**
 * Where Google, Facebook or Telegram send the user back. Supabase swaps the
 * one-time code for a session on page load; this page waits for that and
 * returns the user to where they started.
 */
export default function AuthCallbackPage() {
  const { user, ready } = useAuthStore();
  const [error] = useState(providerError);
  const [timedOut, setTimedOut] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setTimedOut(true), TIMEOUT_MS);
    return () => window.clearTimeout(timer);
  }, []);

  if (error) {
    const reason = error === 'access_denied' ? 'cancelled' : 'failed';
    return <Navigate to={`/sign-in?error=${reason}`} replace />;
  }
  if (ready && user) return <Navigate to={nextPathAfterSignIn()} replace />;
  // Supabase finished without a session, e.g. the link was opened in another
  // browser than the one that started sign-in.
  if ((ready && !user) || timedOut) {
    return <Navigate to="/sign-in?error=failed" replace />;
  }

  return (
    <div className="sign-in-page sign-in-callback">
      <span className="sign-in-spinner sign-in-spinner-large" aria-hidden="true" />
      <p>Signing you in…</p>
    </div>
  );
}
