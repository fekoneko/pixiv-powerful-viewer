import { DependencyList } from 'react';
import useEventListener from './useEventListener';

type Modifiers = {
  control?: boolean;
  shift?: boolean;
  alt?: boolean;
  meta?: boolean;
};

const useKeyboardEvent = (
  type: 'keypress' | 'keyup' | 'keydown',
  keyCode: string | string[],
  callback: (e: KeyboardEvent) => void,
  deps: DependencyList,
  modifiers?: Modifiers,
) => {
  useEventListener(
    null,
    type,
    (e) => {
      const event = e as KeyboardEvent;
      if (
        (typeof keyCode === 'object' ? keyCode.includes(event.code) : event.code === keyCode) &&
        (!modifiers ||
          ((modifiers.control === undefined || event.ctrlKey === !!modifiers.control) &&
            (modifiers.shift === undefined || event.shiftKey === !!modifiers.shift) &&
            (modifiers.alt === undefined || event.altKey === !!modifiers.alt) &&
            (modifiers.meta === undefined || event.metaKey === !!modifiers.meta)))
      ) {
        callback(event);
      }
    },
    [...(deps ?? []), modifiers],
  );
};
export default useKeyboardEvent;
