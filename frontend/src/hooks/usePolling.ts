import { useEffect, useRef, useState } from "react";

export function usePolling<T>(
  fetcher: () => Promise<T>,
  intervalMs: number,
  enabled: boolean,
  stopWhen?: (data: T) => boolean
) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;
  const stopWhenRef = useRef(stopWhen);
  stopWhenRef.current = stopWhen;

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    let id: number | undefined;

    const tick = async () => {
      try {
        const result = await fetcherRef.current();
        if (cancelled) return;
        setData(result);
        if (stopWhenRef.current?.(result) && id !== undefined) {
          clearInterval(id);
        }
      } catch (err) {
        if (!cancelled) setError(err as Error);
      }
    };

    tick();
    id = window.setInterval(tick, intervalMs);
    return () => {
      cancelled = true;
      if (id !== undefined) clearInterval(id);
    };
  }, [intervalMs, enabled]);

  return { data, error };
}
