import { RefObject, useEffect } from 'react';
import { SpringRef, useSpring } from '@react-spring/web';

export type Scroll = { x: number; y: number };
export type AnimateScroll = SpringRef<Scroll>;

export const useAnimateScroll = (scrollContainerRef: RefObject<HTMLElement>) => {
  const [, animateScroll] = useSpring(() => ({
    from: { x: 0, y: 0 },
    onChange: (result) => {
      if (animateScroll.current[0]?.idle) return;
      scrollContainerRef.current?.scrollTo(result.value.x, result.value.y);
    },
    reset: true,
  }));

  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (!scrollContainer) return;

    const updateScroll = () => {
      if (!animateScroll.current[0]?.idle) return;
      animateScroll.set({ x: scrollContainer.scrollLeft, y: scrollContainer.scrollTop });
    };
    scrollContainer.addEventListener('scroll', updateScroll);

    const cancelAnimation = () => animateScroll.stop();
    scrollContainer.addEventListener('wheel', cancelAnimation);

    return () => {
      scrollContainer.removeEventListener('scroll', updateScroll);
      scrollContainer.removeEventListener('wheel', cancelAnimation);
      animateScroll.set({ x: 0, y: 0 });
    };
  }, [animateScroll, scrollContainerRef]);

  return animateScroll;
};
