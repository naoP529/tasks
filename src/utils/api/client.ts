import { env } from '@/constants/env';

import type { ApiErrorBody } from './types';

export type ApiAuth =
  | { token: string }
  | { getToken: () => Promise<string | null | undefined> };

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function resolveToken(auth: ApiAuth): Promise<string> {
  const token = 'token' in auth ? auth.token : await auth.getToken();
  if (!token) {
    throw new ApiError(401, 'Not authenticated');
  }
  return token;
}

function buildUrl(path: string, params?: Record<string, string | number | undefined>): string {
  const url = new URL(path, env.apiUrl);
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined) {
        url.searchParams.set(key, String(value));
      }
    }
  }
  return url.toString();
}

async function parseErrorResponse(res: Response): Promise<string> {
  try {
    const body = (await res.json()) as ApiErrorBody;
    return body.error ?? res.statusText;
  } catch {
    return res.statusText;
  }
}

export async function apiFetch<T>(
  path: string,
  auth: ApiAuth,
  options: RequestInit = {},
): Promise<T> {
  const token = await resolveToken(auth);
  const res = await fetch(buildUrl(path), {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  });

  if (!res.ok) {
    throw new ApiError(res.status, await parseErrorResponse(res));
  }

  if (res.status === 204) {
    return undefined as T;
  }

  return res.json() as Promise<T>;
}

export async function apiFetchPublic<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(buildUrl(path), {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!res.ok) {
    throw new ApiError(res.status, await parseErrorResponse(res));
  }

  return res.json() as Promise<T>;
}

export async function apiFetchWithQuery<T>(
  path: string,
  auth: ApiAuth,
  params: Record<string, string | number | undefined>,
  options: RequestInit = {},
): Promise<T> {
  const token = await resolveToken(auth);
  const res = await fetch(buildUrl(path, params), {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  });

  if (!res.ok) {
    throw new ApiError(res.status, await parseErrorResponse(res));
  }

  if (res.status === 204) {
    return undefined as T;
  }

  return res.json() as Promise<T>;
}

export function checkHealth() {
  return apiFetchPublic<{ status: string }>('/api/health');
}

export function runMigrate() {
  return apiFetchPublic('/api/migrate', { method: 'POST' });
}

export function runMigrateAlter() {
  return apiFetchPublic('/api/migrate/alter', { method: 'POST' });
}
