import { apiFetch, apiFetchWithQuery, type ApiAuth } from './client';
import type {
  CreateScheduleBody,
  PaginationParams,
  Schedule,
  UpdateScheduleBody,
} from './types';

export function getSchedules(auth: ApiAuth, params: PaginationParams = {}) {
  return apiFetchWithQuery<Schedule[]>('/api/schedule', auth, {
    limit: params.limit,
    offset: params.offset,
  });
}

export function getSchedule(auth: ApiAuth, id: string) {
  return apiFetch<Schedule>(`/api/schedule/${id}`, auth);
}

export function createSchedule(auth: ApiAuth, body: CreateScheduleBody) {
  return apiFetch<Schedule>('/api/schedule', auth, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export function updateSchedule(auth: ApiAuth, id: string, body: UpdateScheduleBody) {
  return apiFetch<Schedule>(`/api/schedule/${id}`, auth, {
    method: 'PATCH',
    body: JSON.stringify(body),
  });
}

export function finishSchedule(auth: ApiAuth, id: string) {
  return updateSchedule(auth, id, { is_finished: true });
}

export function deleteSchedule(auth: ApiAuth, id: string) {
  return apiFetch<void>(`/api/schedule/${id}`, auth, { method: 'DELETE' });
}
