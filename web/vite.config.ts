import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icon.svg', 'maskable-icon.svg'],
      manifest: {
        id: '/',
        name: 'Directory - Taunggyi',
        short_name: 'Directory',
        description: 'Taunggyi city directory: hotels, restaurants, banks, shops and more.',
        theme_color: '#FF6B35',
        background_color: '#ffffff',
        display: 'standalone',
        scope: '/',
        start_url: '/',
        shortcuts: [
          {
            name: 'Home',
            url: '/',
            icons: [{ src: 'icon.svg', sizes: 'any', type: 'image/svg+xml' }],
          },
          {
            name: 'Events',
            url: '/events',
            icons: [{ src: 'icon.svg', sizes: 'any', type: 'image/svg+xml' }],
          },
          {
            name: 'Places to Visit',
            url: '/notifications',
            icons: [{ src: 'icon.svg', sizes: 'any', type: 'image/svg+xml' }],
          },
        ],
        icons: [
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
        navigateFallback: '/offline.html',
        globPatterns: ['**/*.{js,css,html,ico,png,svg,webmanifest,json}'],
        runtimeCaching: [
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
