import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import { env } from 'node:process';

const repositoryName = env.GITHUB_REPOSITORY?.split('/')[1];
const base =
  env.GITHUB_ACTIONS === 'true' &&
  repositoryName &&
  !repositoryName.endsWith('.github.io')
    ? `/${repositoryName}/`
    : '/';

const marketDaySource = decodeURIComponent(
  new URL('./vendor/shan-market-day/src/index.ts', import.meta.url).pathname.replace(
    /^\/([A-Z]:\/)/i,
    '$1'
  )
);

export default defineConfig({
  base,
  resolve: {
    alias: {
      'shan-market-day': marketDaySource,
    },
  },
  optimizeDeps: {
    exclude: ['shan-market-day'],
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['apple-touch-icon.png', 'icon.svg', 'maskable-icon.svg'],
      manifest: {
        id: base,
        name: 'Directory - Taunggyi',
        short_name: 'Directory',
        description: 'Taunggyi city directory: hotels, restaurants, banks, shops and more.',
        theme_color: '#14532D',
        background_color: '#F3F7F4',
        display: 'standalone',
        scope: base,
        start_url: base,
        shortcuts: [
          {
            name: 'Home',
            url: base,
            icons: [{ src: 'icon.svg', sizes: 'any', type: 'image/svg+xml' }],
          },
          {
            name: 'Events',
            url: `${base}events`,
            icons: [{ src: 'icon.svg', sizes: 'any', type: 'image/svg+xml' }],
          },
          {
            name: 'Places to Visit',
            url: `${base}notifications`,
            icons: [{ src: 'icon.svg', sizes: 'any', type: 'image/svg+xml' }],
          },
        ],
        icons: [
          {
            src: 'apple-touch-icon.png',
            sizes: '180x180',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: 'icon.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any',
          },
          {
            src: 'maskable-icon.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        // Precache the app shell and bundled data; cache remote images at runtime.
        navigateFallback: `${base}offline.html`,
        // The sign-in return page must load the app from the network, or the
        // provider's one-time code is lost on the offline page.
        navigateFallbackDenylist: [/\/auth\/callback/],
        globPatterns: ['**/*.{js,css,html,ico,png,svg,webmanifest,json}'],
        runtimeCaching: [
          {
            // Backend reads (VITE_DATA_SOURCE=api). Fresh when online; the
            // last response keeps viewed pages working offline.
            urlPattern: ({ url, request }) =>
              request.method === 'GET' && url.pathname.includes('/api/v1/'),
            handler: 'NetworkFirst',
            options: {
              cacheName: 'directory-api',
              networkTimeoutSeconds: 3,
              expiration: { maxEntries: 100, maxAgeSeconds: 7 * 24 * 60 * 60 },
              cacheableResponse: { statuses: [200] },
            },
          },
          {
            urlPattern: /^https:\/\/raw\.githubusercontent\.com\/.*/i,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'directory-data',
              expiration: { maxEntries: 20, maxAgeSeconds: 7 * 24 * 60 * 60 },
            },
          },
          {
            urlPattern: /^https:\/\/images\.unsplash\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'unsplash-images',
              expiration: { maxEntries: 60, maxAgeSeconds: 30 * 24 * 60 * 60 },
            },
          },
        ],
      },
    }),
  ],
  server: {
    port: 5173,
    proxy: {
      // Local backend (Next.js on :3000) during development
      '/api': 'http://localhost:3000',
    },
  },
});
