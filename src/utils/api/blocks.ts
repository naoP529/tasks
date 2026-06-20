import { apiFetch, apiFetchWithQuery, type ApiAuth } from './client';
import type { Block, BlockDetail, CreateBlockBody, UpdateBlockBody } from './types';

export function getBlocks(auth: ApiAuth) {
  return apiFetch<Block[]>('/api/blocks', auth);
}

export function getBlocksByIds(auth: ApiAuth, ids: string[]) {
  return apiFetchWithQuery<BlockDetail[]>('/api/blocks', auth, {
    ids: ids.join(','),
  });
}

export function getBlock(auth: ApiAuth, id: string) {
  return apiFetch<Block>(`/api/blocks/${id}`, auth);
}

export function createBlock(auth: ApiAuth, body: CreateBlockBody) {
  return apiFetch<Block>('/api/blocks', auth, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export function updateBlock(auth: ApiAuth, id: string, body: UpdateBlockBody) {
  return apiFetch<Block>(`/api/blocks/${id}`, auth, {
    method: 'PATCH',
    body: JSON.stringify(body),
  });
}

export function deleteBlock(auth: ApiAuth, id: string) {
  return apiFetch<void>(`/api/blocks/${id}`, auth, { method: 'DELETE' });
}
