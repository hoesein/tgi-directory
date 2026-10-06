import * as Sentry from '@sentry/react';

export function initSentry() {
  const dsn = import.meta.env.VITE_SENTRY_DSN as string | undefined;
  // No-op unless a DSN is configured — keeps local dev/offline builds clean.
  if (!dsn) return;
  Sentry.init({
    dsn,
    environment: import.meta.env.DEV ? 'development' : 'production',
  });
}
