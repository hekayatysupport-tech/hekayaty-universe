/**
 * Central API URL utility for Hekayaty.
 *
 * In development: defaults to http://localhost:5000 (via Vite dev proxy or direct)
 * In production: reads VITE_API_BASE_URL from environment
 *
 * Usage: import { apiUrl } from '@/lib/api';
 *        fetch(apiUrl('/api/admin/characters'))
 */
function getApiBaseUrl(): string {
  const envUrl = import.meta.env.VITE_API_BASE_URL as string | undefined;
  if (import.meta.env.PROD) {
    if (!envUrl || envUrl.includes('localhost') || envUrl.includes('127.0.0.1')) {
      return '';
    }
    return envUrl;
  }
  return envUrl ?? 'http://localhost:5000';
}

export const API_BASE_URL: string = getApiBaseUrl();

/**
 * Returns a full API URL for the given path.
 * @param path - e.g. '/api/admin/users'
 */
export function apiUrl(path: string): string {
  if (!API_BASE_URL) return path;
  return `${API_BASE_URL}${path}`;
}

/**
 * Safely parses a response as JSON, returning fallback if response is HTML or non-OK.
 */
export async function safeFetchJson<T>(url: string, init?: RequestInit, fallback?: T): Promise<T | null> {
  try {
    const res = await fetch(url, init);
    if (!res.ok) return fallback ?? null;
    const contentType = res.headers.get("content-type");
    if (contentType && !contentType.includes("application/json")) {
      return fallback ?? null;
    }
    return (await res.json()) as T;
  } catch {
    return fallback ?? null;
  }
}

