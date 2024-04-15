import { SpringRef, useSpring } from '@react-spring/web';

export type Scroll = { x: number; y: number };
export type AnimateScroll = SpringRef<Scroll>;

const useAnimateScroll = (scrollContainerRef?: React.RefObject<HTMLElement>) => {
  const [, animateScroll]: [scroll: any, animateScroll: AnimateScroll] = useSpring(() => ({
    from: {
      x: scrollContainerRef ? scrollContainerRef.current?.scrollLeft ?? 0 : scrollX,
      y: scrollContainerRef ? scrollContainerRef.current?.scrollTop ?? 0 : scrollY,
    },
    onChange: (result) =>
      (scrollContainerRef ? scrollContainerRef.current : window)?.scrollTo(
        result.value.x,
        result.value.y,
      ),
    reset: true,
  }));

  return animateScroll;
};
export default useAnimateScroll;
