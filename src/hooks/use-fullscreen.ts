import { CSSProperties, RefObject, useCallback, useEffect, useMemo, useState } from 'react';
import { SpringValue, useSpring } from '@react-spring/web';

type TransitionDestination = 'normal' | 'fullscreen' | null;

export type FullscreenState = 'normal' | 'transition' | 'fullscreen';

export type FullscreenStyles = Omit<CSSProperties, 'width' | 'height'> & {
  x?: SpringValue<number>;
  y?: SpringValue<number>;
  width?: SpringValue<number> | CSSProperties['width'];
  height?: SpringValue<number> | CSSProperties['height'];
};

export const useFullscreen = (containerRef: RefObject<HTMLDivElement>) => {
  const [transitionDestination, setTransitionDestination] = useState<TransitionDestination>(null);
  const [fullscreenState, setFullscreenState] = useState<FullscreenState>('normal');

  const [fullscreenSprings, fullscreenAnimate] = useSpring(() => ({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  }));

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const normalStyles = {
      x: 0,
      y: 0,
      width: container.offsetWidth,
      height: container.offsetHeight,
    };

    const fullscreenSyles = {
      x: -container.getBoundingClientRect().x,
      y: -container.getBoundingClientRect().y,
      width: window.innerWidth,
      height: window.innerHeight,
    };

    switch (transitionDestination) {
      case 'fullscreen':
        fullscreenAnimate.start({
          to: fullscreenSyles,
          onStart: () => setFullscreenState('transition'),
          onRest: () => setFullscreenState('fullscreen'),
        });
        break;

      case 'normal':
        fullscreenAnimate.start({
          to: normalStyles,
          onStart: () => setFullscreenState('transition'),
          onRest: () => setFullscreenState('normal'),
        });
        break;

      default:
        fullscreenAnimate.start({
          from: normalStyles,
        });
        break;
    }
  }, [transitionDestination, fullscreenAnimate, containerRef]);

  const goFullscreen = useCallback(() => setTransitionDestination('fullscreen'), []);
  const exitFullscreen = useCallback(() => setTransitionDestination('normal'), []);
  const toggleFullscreen = useCallback(
    () => setTransitionDestination((prev) => (prev === 'fullscreen' ? 'normal' : 'fullscreen')),
    [],
  );

  const fullscreenStyles = useMemo<FullscreenStyles>(() => {
    switch (fullscreenState) {
      case 'transition':
        return {
          ...fullscreenSprings,
          position: 'absolute',
          zIndex: 30,
        };
      case 'fullscreen':
        return {
          position: 'absolute',
          left: 0,
          top: 0,
          zIndex: 30,
          width: '100vw',
          height: '100dvh',
        };
      default:
        return {
          width: '100%',
          height: '100%',
        };
    }
  }, [fullscreenSprings, fullscreenState]);

  return {
    fullscreenState,
    fullscreenStyles,
    goFullscreen,
    exitFullscreen,
    toggleFullscreen,
  };
};
