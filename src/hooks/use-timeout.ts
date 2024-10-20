import { useCallback, useEffect, useState } from 'react';

export const useTimeout = (): [
  timeoutId: ReturnType<typeof setTimeout> | undefined,
  updateTimeout: typeof setTimeout,
] => {
  const [timeoutId, setTimeoutId] = useState<number>();

  const updateTimeout = useCallback((...args: Parameters<typeof setTimeout>) => {
    const newTimeoutId = setTimeout(...args);
    setTimeoutId((prev) => {
      clearTimeout(prev);
      return newTimeoutId;
    });
    return newTimeoutId;
  }, []) as typeof setTimeout;

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => () => clearTimeout(timeoutId), []);

  return [timeoutId, updateTimeout];
};
