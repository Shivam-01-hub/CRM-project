type ApiRequestOptions = RequestInit & {
  accessToken?: string;
};

const defaultApiUrl = '/api';

function getApiBaseUrl() {
  return import.meta.env.VITE_API_URL?.trim() || defaultApiUrl;
}

export async function apiRequest<T>(path: string, options: ApiRequestOptions = {}) {
  let response: Response;

  try {
    response = await fetch(`${getApiBaseUrl()}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options.accessToken ? { Authorization: `Bearer ${options.accessToken}` } : {}),
        ...(options.headers ?? {}),
      },
    });
  } catch {
    throw new Error(`Unable to reach the API at ${getApiBaseUrl()}. Start the backend with npm run dev or check VITE_API_URL.`);
  }

  const rawBody = await response.text();
  let payload = {} as T & { message?: string };

  if (rawBody) {
    try {
      payload = JSON.parse(rawBody) as T & { message?: string };
    } catch {
      payload = { message: rawBody } as T & { message?: string };
    }
  }

  if (!response.ok) {
    throw new Error(payload.message || `API request failed with ${response.status} ${response.statusText}`);
  }

  return payload;
}
