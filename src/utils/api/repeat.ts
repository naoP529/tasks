import { apiFetch, type ApiAuth } from './client';
import type { CreateRepeatBody, Repeat, UpdateRepeatBody } from './types';

export function getRepeat(auth: ApiAuth, id: string) {
  return apiFetch<Repeat>(`/api/repeat/${id}`, auth);
}

export function createRepeat(auth: ApiAuth, body: CreateRepeatBody) {
  return apiFetch<Repeat>('/api/repeat', auth, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export function updateRepeat(auth: ApiAuth, id: string, body: UpdateRepeatBody) {
  return apiFetch<Repeat>(`/api/repeat/${id}`, auth, {
    method: 'PATCH',
    body: JSON.stringify(body),
  });
}

export function deleteRepeat(auth: ApiAuth, id: string) {
  return apiFetch<void>(`/api/repeat/${id}`, auth, { method: 'DELETE' });
}
