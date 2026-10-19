import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from './App';
import { initCloudflareAnalytics } from './lib/cloudflareAnalytics';
import { initSentry } from './lib/sentry';
import { initAuth } from './store/authStore';
// Self-hosted fonts (bundled, so they work offline): DM Sans for text, DM Serif
// Display for titles (a travel-guide feel), Noto Sans Myanmar for Burmese.
import '@fontsource-variable/dm-sans';
import '@fontsource/dm-serif-display/400.css';
import '@fontsource/noto-sans-myanmar/myanmar-400.css';
import '@fontsource/noto-sans-myanmar/myanmar-600.css';
import '@fontsource/noto-sans-myanmar/myanmar-700.css';
import './index.css';

const queryClient = new QueryClient();

initCloudflareAnalytics();
initSentry();
initAuth();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter basename={import.meta.env.BASE_URL}>
        <App />
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>,
);
