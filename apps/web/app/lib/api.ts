const isProduction = process.env.NODE_ENV === 'production';

export const API_BASE_URL = isProduction ? '/api' : (process.env.NEXT_PUBLIC_API_URL ?? '/api');
export const IA_JURIDICA_API_PREFIX = '/api/ia-juridica';

export function resolveApiUrl(path: string) {
  const rawPath = path.startsWith('/') ? path : `/${path}`;
  const normalizedPath = rawPath === '/ia-juridica' || rawPath.startsWith('/ia-juridica/') ? `/api${rawPath}` : rawPath;

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

function redirectToLogin() {
  if (typeof window === 'undefined') {
    return;
  }

  window.location.replace('/login');
}

async function refreshSession() {
  if (typeof window === 'undefined') {
    return null;
  }

  const refreshToken = localStorage.getItem('itzalanRefreshToken');
  if (!refreshToken) {
    return null;
  }

  const response = await fetch(resolveApiUrl('/auth/refresh'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ refreshToken }),
  });

  if (!response.ok) {
    clearExpiredSession();
    redirectToLogin();
    return null;
  }

  const data = (await response.json().catch(() => null)) as { accessToken?: string; refreshToken?: string } | null;
  if (!data?.accessToken || !data.refreshToken) {
    clearExpiredSession();
    redirectToLogin();
    return null;
  }

  localStorage.setItem('itzalanAccessToken', data.accessToken);
  localStorage.setItem('itzalanRefreshToken', data.refreshToken);
  window.dispatchEvent(new Event('authChange'));
  return data.accessToken;
}

export async function getAuthHeaders(): Promise<Record<string, string>> {
  if (typeof window === 'undefined') {
    return {} as Record<string, string>;
  }

  const accessToken = localStorage.getItem('itzalanAccessToken');
  if (accessToken) {
    return { Authorization: `Bearer ${accessToken}` };
  }

  const refreshedToken = await refreshSession();
  if (refreshedToken) {
    return { Authorization: `Bearer ${refreshedToken}` };
  }

  redirectToLogin();
  throw new Error('Tu sesión expiró. Inicia sesión nuevamente.');
}

export async function apiFetch(path: string, init: RequestInit = {}) {
  const resolvedUrl = resolveApiUrl(path);
  const headers = {
    'Content-Type': 'application/json',
    ...(init.headers || {}),
  } as Record<string, string>;

  const response = await fetch(resolvedUrl, {
    ...init,
    headers,
  });

  if (response.status !== 401 || resolvedUrl.includes('/auth/')) {
    return response;
  }

  const refreshedToken = await refreshSession();
  if (!refreshedToken) {
    redirectToLogin();
    return response;
  }

  return fetch(resolvedUrl, {
    ...init,
    headers: {
      ...headers,
      Authorization: `Bearer ${refreshedToken}`,
    },
  });
}
