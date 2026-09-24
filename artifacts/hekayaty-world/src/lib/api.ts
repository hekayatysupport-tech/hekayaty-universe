/**
 * Central API URL utility for Hekayaty.
 *
 * In development: defaults to http://localhost:5000 (via Vite dev proxy or direct)
 * In production: reads VITE_API_BASE_URL from environment (set in .env.production or Vercel env vars)
 *
 * Usage: import { apiUrl } from '@/lib/api';
 *        fetch(apiUrl('/api/admin/characters'))
 */
export const API_BASE_URL: string =
  (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? 'http://localhost:5000';

/**
 * Returns a full API URL for the given path.
 * @param path - e.g. '/api/admin/users'
 */
export function apiUrl(path: string): string {
  return `${API_BASE_URL}${path}`;
}
