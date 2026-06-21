export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

export async function apiFetch(path: string, init: RequestInit = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...(init.headers || {}),
  } as Record<string, string>;

  return fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers,
  });
}
