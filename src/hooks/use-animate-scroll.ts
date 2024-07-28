import { RefObject } from 'react';
import { SpringRef, useSpring } from '@react-spring/web';

export type Scroll = { x: number; y: number };
export type AnimateScroll = SpringRef<Scroll>;

export const useAnimateScroll = (scrollContainerRef?: RefObject<HTMLElement>) => {
  const [, animateScroll]: [scroll: any, animateScroll: AnimateScroll] = useSpring(() => ({
    from: {
      x: scrollContainerRef?.current?.scrollLeft ?? scrollX,
      y: scrollContainerRef?.current?.scrollTop ?? scrollY,
    },
    onChange: (result) => {
      const target = scrollContainerRef?.current ?? window;
      target.scrollTo(result.value.x, result.value.y);
    },
    reset: true,
  }));

  return animateScroll;
};
