import { useAuth } from '@clerk/expo';
import { useMemo, useRef } from 'react';

import { createApiClient, type ApiClient } from '@/utils/api';

export function useApiClient(): ApiClient {
  const { getToken } = useAuth();
  const getTokenRef = useRef(getToken);
  getTokenRef.current = getToken;

  return useMemo(
    () =>
      createApiClient({
        getToken: () => getTokenRef.current(),
      }),
    [],
  );
}

export type { ApiClient };
