export const apiQueryKeys = {
  user: {
    me: ['users', 'me'] as const,
  },
  blocks: {
    all: ['blocks'] as const,
    detail: (id: string) => ['blocks', id] as const,
    byIds: (ids: string[]) => ['blocks', 'byIds', ...ids.sort()] as const,
  },
  plans: {
    detail: (blockId: string) => ['plans', blockId] as const,
  },
  repeat: {
    detail: (id: string) => ['repeat', id] as const,
  },
  schedule: {
    all: (params?: { limit?: number; offset?: number }) =>
      ['schedule', params ?? {}] as const,
    detail: (id: string) => ['schedule', id] as const,
  },
  section: {
    calendar: (start: string, end: string) => ['calendar', start, end] as const,
    remainingBlocks: ['remaining_blocks'] as const,
    finishedBlocks: (params?: { limit?: number; offset?: number }) =>
      ['finished_blocks', params ?? {}] as const,
  },
  login: {
    history: (params?: { limit?: number; offset?: number }) =>
      ['login', params ?? {}] as const,
  },
} as const;
