// Web storage — same interface as the native MMKV wrapper so ApiService
// and stores work unchanged. Backed by localStorage (PWA-safe).

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
    return localStorage.getItem(this.prefix + key) ?? undefined;
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
    localStorage.setItem(this.prefix + key, String(value));
  }

  delete(key: string): void {
    localStorage.removeItem(this.prefix + key);
  }

  clearAll(): void {
    Object.keys(localStorage)
      .filter((key) => key.startsWith(this.prefix))
      .forEach((key) => localStorage.removeItem(key));
  }
}

export const storage = new WebStorage();
