const isProduction = process.env.NODE_ENV === 'production';

export const API_BASE_URL = isProduction ? '/api' : (process.env.NEXT_PUBLIC_API_URL ?? '/api');

export function resolveApiUrl(path: string) {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;

  if (API_BASE_URL === '/api') {
    if (normalizedPath === '/api' || normalizedPath.startsWith('/api/')) {
      return normalizedPath;
    }

    return `/api${normalizedPath}`;
  }

  if (API_BASE_URL.endsWith('/')) {
    return `${API_BASE_URL.slice(0, -1)}${normalizedPath}`;
  }

  return `${API_BASE_URL}${normalizedPath}`;
}

function clearExpiredSession() {
  if (typeof window === 'undefined') {
    return;
  }

  localStorage.removeItem('itzalanAccessToken');
  localStorage.removeItem('itzalanRefreshToken');
  window.dispatchEvent(new Event('authChange'));
}

export async function apiFetch(path: string, init: RequestInit = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...(init.headers || {}),
  } as Record<string, string>;

  const response = await fetch(resolveApiUrl(path), {
    ...init,
    headers,
  });

  if (response.status === 401) {
    clearExpiredSession();
  }

  return response;
}
