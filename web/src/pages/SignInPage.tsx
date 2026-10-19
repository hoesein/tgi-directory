import { useState } from 'react';
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import BackButton from '../components/BackButton';
import ProviderIcon from '../components/ProviderIcon';
import {
  authCallbackUrl,
  enabledProviders,
  rememberNextPath,
  safeNextPath,
  type SignInProvider,
} from '../lib/auth';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';

const ERROR_MESSAGES: Record<string, string> = {
  cancelled: 'Sign-in was cancelled. Try again when you are ready.',
  failed: "Sign-in didn't finish. Please try again.",
};

/** Social sign-in for app users (TGI-22). Browsing never needs it. */
export default function SignInPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const next = safeNextPath(params.get('next'));
  const { user, ready } = useAuthStore();
  const [pending, setPending] = useState<SignInProvider['id'] | null>(null);
  const [error, setError] = useState<string | null>(
    ERROR_MESSAGES[params.get('error') ?? ''] ?? null
  );
  const providers = enabledProviders();

  if (ready && user) return <Navigate to={next} replace />;

  const startSignIn = async (provider: SignInProvider) => {
    if (!supabase) return;
    setPending(provider.id);
    setError(null);
    rememberNextPath(next);
    const { error: signInError } = await supabase.auth.signInWithOAuth({
      provider: provider.supabaseProvider,
      options: { redirectTo: authCallbackUrl() },
    });
    // On success the browser is already leaving for the provider.
    if (signInError) {
      setPending(null);
      setError(ERROR_MESSAGES.failed);
    }
  };

  const leave = () => navigate(next, { replace: true });

  return (
    <div className="sign-in-page">
      <div className="sign-in-top">
        <BackButton onBack={leave} />
      </div>

      <div className="sign-in-body">
        <img className="sign-in-logo" src={`${import.meta.env.BASE_URL}icon.svg`} alt="" />
        <h1>Sign in</h1>
        <p className="sign-in-lead">Rate places and suggest updates.</p>

        {error ? (
          <p className="sign-in-error" role="alert">
            {error}
          </p>
        ) : null}

        {!supabase || providers.length === 0 ? (
          <p className="sign-in-note">Sign-in isn&apos;t available yet.</p>
        ) : (
          <div className="sign-in-buttons">
            {providers.map((provider) => (
              <button
                key={provider.id}
                type="button"
                className={`sign-in-button sign-in-${provider.id}`}
                onClick={() => void startSignIn(provider)}
                disabled={pending !== null}
                aria-busy={pending === provider.id}
              >
                <span className="sign-in-button-icon">
                  {pending === provider.id ? (
                    <span className="sign-in-spinner" aria-hidden="true" />
                  ) : (
                    <ProviderIcon provider={provider.id} />
                  )}
                </span>
                <span className="sign-in-button-label">{provider.label}</span>
              </button>
            ))}
          </div>
        )}

        <button className="sign-in-skip" type="button" onClick={leave}>
          Not now
        </button>
      </div>

      <p className="sign-in-footer">
        Browsing never needs an account. <Link to="/profile/about">Privacy &amp; data</Link>
      </p>
    </div>
  );
}
