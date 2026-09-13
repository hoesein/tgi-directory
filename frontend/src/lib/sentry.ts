import * as Sentry from '@sentry/react-native';

export function initSentry() {
  Sentry.init({
    dsn: 'YOUR_DSN_HERE',
    environment: __DEV__ ? 'development' : 'production',
  });
}
