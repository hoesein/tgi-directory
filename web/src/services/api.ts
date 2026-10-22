import { useAuthStore } from '../store/authStore';

// Vite dev proxies "/api" to the Next.js backend (see vite.config.ts).
// In production set VITE_API_URL to the deployed backend URL.
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

/** A failed API call, with the HTTP status and the backend's error code. */
export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly code?: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

interface RequestOptions extends RequestInit {
  params?: Record<string, string>;
  /** Send the signed-in user's token. Public reads leave it off. */
  auth?: boolean;
}

class ApiService {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  /**
   * Public reads send no custom headers, so the browser skips the CORS
   * preflight and Vercel's edge cache can answer them (TGI-66).
   */
  private getHeaders(auth: boolean, hasBody: boolean): Record<string, string> {
    const headers: Record<string, string> = {};
    if (hasBody) headers['Content-Type'] = 'application/json';

    const token = auth ? useAuthStore.getState().userToken : null;
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
  }

  private async request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const { params, auth = true, ...fetchOptions } = options;

    let url = `${this.baseUrl}${endpoint}`;
    if (params) {
      const searchParams = new URLSearchParams(params);
      url += `?${searchParams.toString()}`;
    }

    const response = await fetch(url, {
      ...fetchOptions,
      headers: {
        ...this.getHeaders(auth, fetchOptions.body !== undefined),
        ...fetchOptions.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Request failed' }));
      throw new ApiError(error.message || 'Request failed', response.status, error.code);
    }

    // 204 No Content (e.g. DELETE) has no body to parse.
    if (response.status === 204) return undefined as T;

    return response.json();
  }

  /** `signal` lets callers (e.g. TanStack Query) cancel a request that is no longer needed. */
  async get<T>(endpoint: string, params?: Record<string, string>, signal?: AbortSignal): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET', params, signal, auth: false });
  }

  /** A read that needs the signed-in user (my rating, my suggestions). */
  async getMine<T>(endpoint: string, params?: Record<string, string>, signal?: AbortSignal): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET', params, signal, auth: true });
  }

  async post<T>(endpoint: string, body?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async put<T>(endpoint: string, body?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

export const api = new ApiService(API_BASE_URL);
