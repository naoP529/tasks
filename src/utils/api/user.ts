import { apiFetch, apiFetchWithQuery, type ApiAuth } from './client';
import type {
  LoginRecord,
  PaginatedLoginHistory,
  PaginationParams,
  UpdateUserBody,
  User,
} from './types';

export function getMe(auth: ApiAuth) {
  return apiFetch<User>('/api/users/me', auth);
}

export function updateMe(auth: ApiAuth, body: UpdateUserBody) {
  return apiFetch<User>('/api/users/me', auth, {
    method: 'PATCH',
    body: JSON.stringify(body),
  });
}

export function recordLogin(auth: ApiAuth) {
  return apiFetch<LoginRecord>('/api/login', auth, {
    method: 'POST',
    body: JSON.stringify({}),
  });
}

export function getLoginHistory(auth: ApiAuth, params: PaginationParams = {}) {
  return apiFetchWithQuery<PaginatedLoginHistory>('/api/login', auth, {
    limit: params.limit,
    offset: params.offset,
  });
}
