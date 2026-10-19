import type { Provider, User } from '@supabase/supabase-js';

export type SignInProviderId = 'google' | 'facebook' | 'telegram';

export interface SignInProvider {
  id: SignInProviderId;
  label: string;
  supabaseProvider: Provider;
}

// App users sign in with social providers only; email + password is for the
// admin portal. TikTok needs a backend bridge first (TGI-43).
const ALL_PROVIDERS: SignInProvider[] = [
  { id: 'google', label: 'Continue with Google', supabaseProvider: 'google' },
  { id: 'facebook', label: 'Continue with Facebook', supabaseProvider: 'facebook' },
  { id: 'telegram', label: 'Continue with Telegram', supabaseProvider: 'custom:telegram' },
];

/** Providers shown on the sign-in screen. VITE_AUTH_PROVIDERS narrows the list. */
export function enabledProviders(): SignInProvider[] {
  const setting = import.meta.env.VITE_AUTH_PROVIDERS?.trim();
  if (!setting) return ALL_PROVIDERS;
  const wanted = new Set(setting.split(',').map((value: string) => value.trim().toLowerCase()));
  return ALL_PROVIDERS.filter((provider) => wanted.has(provider.id));
}

/** Where the provider sends the user back to. Must be in Supabase's redirect URLs. */
export function authCallbackUrl(): string {
  return new URL(`${import.meta.env.BASE_URL}auth/callback`, window.location.origin).href;
}

const NEXT_KEY = 'directory_auth_next';

/** Only same-app paths, so a crafted link can't send users to another site. */
export function safeNextPath(value: string | null | undefined): string {
  if (!value || !value.startsWith('/') || value.startsWith('//') || value.startsWith('/\\')) {
    return '/';
  }
  return value;
}

export function rememberNextPath(path: string): void {
  try {
    sessionStorage.setItem(NEXT_KEY, safeNextPath(path));
  } catch {
    // Private mode: the user lands on the home page instead.
  }
}

/** Read-only, so a repeated render gets the same answer. Each sign-in overwrites it. */
export function nextPathAfterSignIn(): string {
  try {
    return safeNextPath(sessionStorage.getItem(NEXT_KEY));
  } catch {
    return '/';
  }
}

function metaString(user: User, key: string): string | null {
  const value = user.user_metadata?.[key];
  return typeof value === 'string' && value.trim() ? value.trim() : null;
}

/** Same order as the backend's profile trigger. */
export function userDisplayName(user: User): string {
  return (
    metaString(user, 'display_name') ??
    metaString(user, 'full_name') ??
    metaString(user, 'name') ??
    metaString(user, 'preferred_username') ??
    metaString(user, 'user_name') ??
    'Signed in'
  );
}

export function userAvatarUrl(user: User): string | null {
  return metaString(user, 'avatar_url') ?? metaString(user, 'picture');
}

const PROVIDER_NAMES: Record<string, string> = {
  google: 'Google',
  facebook: 'Facebook',
  'custom:telegram': 'Telegram',
  telegram: 'Telegram',
  email: 'Email',
};

export function userProviderName(user: User): string | null {
  const provider = user.app_metadata?.provider;
  return typeof provider === 'string' ? (PROVIDER_NAMES[provider] ?? provider) : null;
}
