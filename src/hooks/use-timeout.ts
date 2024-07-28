import { useCallback, useState } from 'react';

export const useTimeout = (): [
  timeoutId: ReturnType<typeof setTimeout> | undefined,
  updateTimeout: typeof setTimeout,
] => {
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout>();

  const updateTimeout = useCallback((...args: Parameters<typeof setTimeout>) => {
    const newTimeoutId = setTimeout(...args);
    setTimeoutId((prev) => {
      clearTimeout(prev);
      return newTimeoutId;
    });
    return newTimeoutId;
  }, []) as typeof setTimeout;

  return [timeoutId, updateTimeout];
};
