const API_URL = import.meta.env.VITE_API_URL ?? '/api';

let accessToken: string | null = null;
let refreshPromise: Promise<string | null> | null = null;

export function setAccessToken(token: string | null) {
  accessToken = token;
}

export function getAccessToken() {
  return accessToken;
}

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string,
    public details?: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code?: string;
    details?: unknown;
  };
}

async function readApiResponse<T>(response: Response): Promise<ApiResponse<T> | null> {
  const text = await response.text();

  if (!text) return null;

  try {
    return JSON.parse(text) as ApiResponse<T>;
  } catch {
    return null;
  }
}

function getErrorMessage(response: Response, body: ApiResponse<unknown> | null): string {
  if (body?.error?.message) return body.error.message;

  if (response.status >= 500) {
    return 'Unable to reach the API server. Make sure the server is running and try again.';
  }

  return response.statusText || 'Request failed';
}

async function refreshAccessToken(): Promise<string | null> {
  const response = await fetch(`${API_URL}/auth/refresh`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
  });

  if (!response.ok) return null;

  const body = await readApiResponse<{ accessToken: string }>(response);
  if (!body?.success || !body.data?.accessToken) return null;

  accessToken = body.data.accessToken;
  return accessToken;
}

async function request<T>(path: string, options?: RequestInit, retry = true): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options?.headers as Record<string, string>),
  };

  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }

  const response = await fetch(`${API_URL}${path}`, {
    credentials: 'include',
    ...options,
    headers,
  });

  if (response.status === 401 && retry && path !== '/auth/refresh' && path !== '/auth/login') {
    if (!refreshPromise) {
      refreshPromise = refreshAccessToken().finally(() => {
        refreshPromise = null;
      });
    }

    const newToken = await refreshPromise;
    if (newToken) {
      return request<T>(path, options, false);
    }
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const body = await readApiResponse<T>(response);

  if (!response.ok || !body?.success) {
    throw new ApiError(
      getErrorMessage(response, body),
      response.status,
      body?.error?.code,
      body?.error?.details,
    );
  }

  return body.data as T;
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, data: unknown = {}) =>
    request<T>(path, { method: 'POST', body: JSON.stringify(data) }),
  put: <T>(path: string, data: unknown) =>
    request<T>(path, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (path: string) => request<void>(path, { method: 'DELETE' }),
};
