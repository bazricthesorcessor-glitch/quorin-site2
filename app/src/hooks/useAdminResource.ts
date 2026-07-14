import { useCallback, useEffect, useRef, useState } from 'react';

export interface AdminResourceState<T> {
  data: T | null;
  loading: boolean;
  refreshing: boolean;
  error: string | null;
  reload: () => Promise<void>;
  setData: React.Dispatch<React.SetStateAction<T | null>>;
}

/**
 * Small async resource primitive for admin screens.
 * - Ignores stale responses after a newer request starts.
 * - Keeps existing data visible during refresh.
 * - Exposes retryable error state without native alerts.
 */
export function useAdminResource<T>(loader: () => Promise<T>, deps: readonly unknown[] = []): AdminResourceState<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const requestId = useRef(0);
  const mounted = useRef(true);

  useEffect(() => () => { mounted.current = false; }, []);

  const reload = useCallback(async () => {
    const id = ++requestId.current;
    setError(null);
    if (data === null) setLoading(true);
    else setRefreshing(true);
    try {
      const next = await loader();
      if (mounted.current && id === requestId.current) setData(next);
    } catch (cause) {
      if (mounted.current && id === requestId.current) setError(cause instanceof Error ? cause.message : 'Something went wrong.');
    } finally {
      if (mounted.current && id === requestId.current) { setLoading(false); setRefreshing(false); }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => { void reload(); }, [reload]);

  return { data, loading, refreshing, error, reload, setData };
}
