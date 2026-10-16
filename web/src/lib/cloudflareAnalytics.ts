const BEACON_SCRIPT_URL = 'https://static.cloudflareinsights.com/beacon.min.js';

export function initCloudflareAnalytics(): void {
  const token = import.meta.env.VITE_CLOUDFLARE_WEB_ANALYTICS_TOKEN?.trim();
  if (!token || import.meta.env.DEV) return;

  const script = document.createElement('script');
  script.defer = true;
  script.src = BEACON_SCRIPT_URL;
  script.dataset.cfBeacon = JSON.stringify({ token });
  document.head.appendChild(script);
}
