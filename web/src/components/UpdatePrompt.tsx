import { RefreshCw } from 'lucide-react';
import { useRegisterSW } from 'virtual:pwa-register/react';

/** Check for a new version this often while the app stays open. */
const UPDATE_CHECK_MS = 60 * 60 * 1000;

/**
 * "New version available" bar. The new service worker waits until the user
 * taps Refresh, so the app never swaps underneath them mid-task.
 */
export default function UpdatePrompt() {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(_url, registration) {
      if (!registration) return;
      window.setInterval(() => {
        if (navigator.onLine) void registration.update();
      }, UPDATE_CHECK_MS);
    },
  });

  if (!needRefresh) return null;

  return (
    <div className="update-prompt" role="alert">
      <RefreshCw size={18} aria-hidden="true" />
      <span className="update-prompt-text">New version available</span>
      <button className="update-prompt-later" type="button" onClick={() => setNeedRefresh(false)}>
        Later
      </button>
      <button className="update-prompt-refresh" type="button" onClick={() => void updateServiceWorker(true)}>
        Refresh
      </button>
    </div>
  );
}
