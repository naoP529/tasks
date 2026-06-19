import { apiFetch, apiFetchWithQuery, type ApiAuth } from './client';
import type {
  BlockDetail,
  CalendarEvent,
  CalendarParams,
  PaginatedFinishedBlocks,
  PaginationParams,
} from './types';

export function getCalendar(auth: ApiAuth, params: CalendarParams) {
  return apiFetchWithQuery<CalendarEvent[]>('/api/calendar', auth, {
    start: params.start,
    end: params.end,
  });
}

export function getRemainingBlocks(auth: ApiAuth) {
  return apiFetch<BlockDetail[]>('/api/remaining_blocks', auth);
}

export function getFinishedBlocks(auth: ApiAuth, params: PaginationParams = {}) {
  return apiFetchWithQuery<PaginatedFinishedBlocks>('/api/finished_blocks', auth, {
    limit: params.limit,
    offset: params.offset,
  });
}
