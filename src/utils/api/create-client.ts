import type { ApiAuth } from './client';
import * as blocks from './blocks';
import * as fetchSectionData from './fetch_section_data';
import * as plan from './plan';
import * as repeat from './repeat';
import * as schedule from './schedule';
import * as user from './user';

export function createApiClient(auth: ApiAuth) {
  return {
    user: {
      getMe: () => user.getMe(auth),
      updateMe: (body: Parameters<typeof user.updateMe>[1]) => user.updateMe(auth, body),
      recordLogin: () => user.recordLogin(auth),
      getLoginHistory: (params?: Parameters<typeof user.getLoginHistory>[1]) =>
        user.getLoginHistory(auth, params),
    },
    blocks: {
      getAll: () => blocks.getBlocks(auth),
      getByIds: (ids: string[]) => blocks.getBlocksByIds(auth, ids),
      get: (id: string) => blocks.getBlock(auth, id),
      create: (body: Parameters<typeof blocks.createBlock>[1]) => blocks.createBlock(auth, body),
      update: (id: string, body: Parameters<typeof blocks.updateBlock>[2]) =>
        blocks.updateBlock(auth, id, body),
      delete: (id: string) => blocks.deleteBlock(auth, id),
    },
    plans: {
      get: (blockId: string) => plan.getPlan(auth, blockId),
      create: (body: Parameters<typeof plan.createPlan>[1]) => plan.createPlan(auth, body),
      update: (blockId: string, body: Parameters<typeof plan.updatePlan>[2]) =>
        plan.updatePlan(auth, blockId, body),
      delete: (blockId: string) => plan.deletePlan(auth, blockId),
    },
    repeat: {
      get: (id: string) => repeat.getRepeat(auth, id),
      create: (body: Parameters<typeof repeat.createRepeat>[1]) => repeat.createRepeat(auth, body),
      update: (id: string, body: Parameters<typeof repeat.updateRepeat>[2]) =>
        repeat.updateRepeat(auth, id, body),
      delete: (id: string) => repeat.deleteRepeat(auth, id),
    },
    schedule: {
      getAll: (params?: Parameters<typeof schedule.getSchedules>[1]) =>
        schedule.getSchedules(auth, params),
      get: (id: string) => schedule.getSchedule(auth, id),
      create: (body: Parameters<typeof schedule.createSchedule>[1]) =>
        schedule.createSchedule(auth, body),
      update: (id: string, body: Parameters<typeof schedule.updateSchedule>[2]) =>
        schedule.updateSchedule(auth, id, body),
      finish: (id: string) => schedule.finishSchedule(auth, id),
      delete: (id: string) => schedule.deleteSchedule(auth, id),
    },
    section: {
      getCalendar: (params: Parameters<typeof fetchSectionData.getCalendar>[1]) =>
        fetchSectionData.getCalendar(auth, params),
      getRemainingBlocks: () => fetchSectionData.getRemainingBlocks(auth),
      getFinishedBlocks: (params?: Parameters<typeof fetchSectionData.getFinishedBlocks>[1]) =>
        fetchSectionData.getFinishedBlocks(auth, params),
    },
  };
}

export type ApiClient = ReturnType<typeof createApiClient>;
