import 'pwa-add-to-homescreen/dist/add-to-homescreen_en.min.js';
import 'pwa-add-to-homescreen/dist/add-to-homescreen.min.css';

interface AddToHomeScreenInstance {
  show: (locale?: string) => void;
}

interface AddToHomeScreenOptions {
  appName: string;
  appNameDisplay: 'standalone' | 'inline';
  appIconUrl: string;
  assetUrl: string;
  displayOptions: {
    showMobile: boolean;
    showDesktop: boolean;
  };
  allowClose: boolean;
  showArrow: boolean;
}

declare global {
  interface Window {
    AddToHomeScreen?: (
      options: AddToHomeScreenOptions
    ) => AddToHomeScreenInstance;
  }

  interface Navigator {
    standalone?: boolean;
  }
}

let instance: AddToHomeScreenInstance | undefined;

export function isMobileBrowser(): boolean {
  const userAgent = navigator.userAgent;
  return (
    /Android|iPhone|iPad|iPod|Mobile/i.test(userAgent) ||
    (/Macintosh/i.test(userAgent) && navigator.maxTouchPoints > 1)
  );
}

export function isRunningAsInstalledApp(): boolean {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    navigator.standalone === true
  );
}

export function showAddToHomeScreenGuide(): void {
  if (!instance) {
    if (!window.AddToHomeScreen) {
      throw new Error('The add-to-homescreen library did not load.');
    }

    instance = window.AddToHomeScreen({
      appName: 'Directory - Taunggyi',
      appNameDisplay: 'inline',
      appIconUrl: `${window.location.origin}${import.meta.env.BASE_URL}apple-touch-icon.png`,
      assetUrl: `${import.meta.env.BASE_URL}add-to-homescreen/assets/img/`,
      displayOptions: { showMobile: true, showDesktop: false },
      allowClose: true,
      showArrow: true,
    });
  }

  instance.show('en');
}
