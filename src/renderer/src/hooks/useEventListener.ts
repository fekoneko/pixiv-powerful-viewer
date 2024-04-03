import { DependencyList, RefObject, useEffect } from 'react';

const useEventListener = <K extends keyof HTMLElementEventMap>(
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
  }, [...(deps ?? []), targetRef?.current, type, listener]);
};
export default useEventListener;
