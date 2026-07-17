type ApiRequestOptions = RequestInit & {
  accessToken?: string;
};

const defaultApiUrl = '/api';

function getApiBaseUrl() {
  return import.meta.env.VITE_API_URL?.trim() || defaultApiUrl;
}

export async function apiRequest<T>(path: string, options: ApiRequestOptions = {}) {
  const response = await fetch(`${getApiBaseUrl()}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.accessToken ? { Authorization: `Bearer ${options.accessToken}` } : {}),
      ...(options.headers ?? {}),
    },
  });

  const payload = (await response.json().catch(() => ({}))) as T & { message?: string };

  if (!response.ok) {
    throw new Error(payload.message || 'Request failed');
  }

  return payload;
}
