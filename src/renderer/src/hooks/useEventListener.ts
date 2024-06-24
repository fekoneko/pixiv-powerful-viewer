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

    // We need this rule disabled to destructure dependency array here -> ...(deps ?? [])
    // This is needed so the user can pass custom dependencies to this hook
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...(deps ?? []), targetRef, options, type, listener]);
};
export default useEventListener;
