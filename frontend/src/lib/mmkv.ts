import { Platform } from 'react-native';

interface Storage {
  getString(key: string): string | undefined;
  getNumber(key: string): number | undefined;
  getBoolean(key: string): boolean | undefined;
  set(key: string, value: string | number | boolean): void;
  delete(key: string): void;
  clearAll(): void;
}

class WebStorage implements Storage {
  private prefix = 'directory_app_';

  getString(key: string): string | undefined {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(this.prefix + key) ?? undefined;
    }
    return undefined;
  }

  getNumber(key: string): number | undefined {
    const value = this.getString(key);
    return value ? Number(value) : undefined;
  }

  getBoolean(key: string): boolean | undefined {
    const value = this.getString(key);
    return value ? value === 'true' : undefined;
  }

  set(key: string, value: string | number | boolean): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.prefix + key, String(value));
    }
  }

  delete(key: string): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(this.prefix + key);
    }
  }

  clearAll(): void {
    if (typeof window !== 'undefined') {
      Object.keys(localStorage)
        .filter((key) => key.startsWith(this.prefix))
        .forEach((key) => localStorage.removeItem(key));
    }
  }
}

function createStorage(): Storage {
  if (Platform.OS === 'web') {
    return new WebStorage();
  }

  try {
    // Dynamic require: static import would load the native module on web
    // and crash. Web is handled by the early return above; this path is
    // native-only with a safe fallback.
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { MMKV } = require('react-native-mmkv');
    return new MMKV({ id: 'directory-app' });
  } catch {
    console.warn('MMKV not available, using web fallback');
    return new WebStorage();
  }
}

export const storage = createStorage();
