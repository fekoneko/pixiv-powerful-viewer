import { bind, unbind } from 'wanakana';
import { RefObject, useEffect } from 'react';

/**
 * Warning! Use onInput instead of onChange in binded element to let React detect all the value changes
 */
export const useWanakana = (
  bindRef: RefObject<HTMLInputElement | HTMLTextAreaElement>,
  options?: Parameters<typeof bind>[1],
  enabled?: boolean,
) => {
  useEffect(() => {
    if (!enabled) return;
    const bindElement = bindRef.current;
    if (!bindElement) return;

    bind(bindElement, options);
    return () => unbind(bindElement);
  }, [enabled, bindRef, options]);
};
