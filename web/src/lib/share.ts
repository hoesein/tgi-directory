import { showToast } from '../store/toastStore';

/** Full URL for an in-app path, including the GitHub Pages base (e.g. /tgi-directory/). */
export function appUrl(path: string): string {
  return new URL(path.replace(/^\//, ''), `${window.location.origin}${import.meta.env.BASE_URL}`).href;
}

/**
 * Opens the phone's share sheet (Messenger, Viber, Telegram…). Where that
 * isn't available (most desktop browsers), copies the link instead.
 */
export async function shareLink({ title, text, path }: { title: string; text?: string; path: string }): Promise<void> {
  const url = appUrl(path);
  if (navigator.share) {
    try {
      await navigator.share({ title, text, url });
    } catch (error) {
      // Closing the share sheet is not an error worth showing.
      if (error instanceof DOMException && error.name === 'AbortError') return;
      await copyLink(url);
    }
    return;
  }
  await copyLink(url);
}

async function copyLink(url: string): Promise<void> {
  try {
    await navigator.clipboard.writeText(url);
    showToast('Link copied');
  } catch {
    showToast('Couldn’t share this link');
  }
}
