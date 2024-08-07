import { RefObject, useEffect } from 'react';
import { bind, unbind } from 'wanakana';

/**
 * Warning! Use onInput instead of onChange in binded element to let React detect all the value changes
 */
export const useWanakana = (
  bindRef: RefObject<HTMLInputElement | HTMLTextAreaElement>,
  options?: Parameters<typeof bind>[1],
  enabled?: boolean,
) => {
  useEffect(() => {
    const bindElement = bindRef.current;
    if (!enabled || !bindElement) return;

    bind(bindElement, options);

    return () => unbind(bindElement);
  }, [enabled, bindRef, options]);
};
