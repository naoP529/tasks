import { apiFetch, type ApiAuth } from './client';
import type { CreatePlanBody, Plan, UpdatePlanBody } from './types';

export function getPlan(auth: ApiAuth, blockId: string) {
  return apiFetch<Plan>(`/api/plans/${blockId}`, auth);
}

export function createPlan(auth: ApiAuth, body: CreatePlanBody) {
  return apiFetch<Plan>('/api/plans', auth, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export function updatePlan(auth: ApiAuth, blockId: string, body: UpdatePlanBody) {
  return apiFetch<Plan>(`/api/plans/${blockId}`, auth, {
    method: 'PATCH',
    body: JSON.stringify(body),
  });
}

export function deletePlan(auth: ApiAuth, blockId: string) {
  return apiFetch<void>(`/api/plans/${blockId}`, auth, { method: 'DELETE' });
}
