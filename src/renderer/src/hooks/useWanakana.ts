import { bind, unbind } from 'wanakana';
import { RefObject, useEffect } from 'react';

// Warning! Use onInput instead of onChange in binded element to let React detect all the value changes
const useWanakana = (
  bindRef: RefObject<HTMLInputElement | HTMLTextAreaElement>,
  options?: Parameters<typeof bind>[1],
  enabled?: boolean,
) => {
  useEffect(() => {
    if (!enabled) return;

    if (bindRef.current) bind(bindRef.current, options);
    return () => {
      if (bindRef.current) unbind(bindRef.current);
    };
  }, [enabled]);
};
export default useWanakana;
