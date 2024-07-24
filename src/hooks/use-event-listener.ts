import { DependencyList, RefObject, useEffect } from 'react';

export const useEventListener = <K extends keyof HTMLElementEventMap>(
  targetRef: RefObject<HTMLElement> | null,
  type: K,
  listener: EventListenerOrEventListenerObject,
  deps?: DependencyList,
  options?: boolean | EventListenerOptions | undefined,
) => {
  useEffect(() => {
    const target = targetRef ? targetRef.current : window;
    target?.addEventListener(type, listener, options);
    return () => target?.removeEventListener(type, listener, options);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...(deps ?? []), targetRef, options, type, listener]);
};
