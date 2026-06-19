import { useAuth } from '@clerk/expo';
import { useMemo } from 'react';

import { createApiClient, type ApiClient } from '@/utils/api';

/**
 * Clerk の JWT を使って BLOCKS API を呼び出すクライアントを返す。
 *
 * 画面からのデータ取得・更新はこの Hook 経由で行う。
 *
 * @example
 * ```tsx
 * const api = useApiClient();
 * const blocks = await api.blocks.getAll();
 * ```
 */
export function useApiClient(): ApiClient {
  const { getToken } = useAuth();
  return useMemo(() => createApiClient({ getToken }), [getToken]);
}
