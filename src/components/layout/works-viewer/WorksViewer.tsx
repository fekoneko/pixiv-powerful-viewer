import { WorksList } from '@/components/layout/works-viewer/WorksList';
import { WorkView } from '@/components/layout/works-viewer/WorkView';
import { FC, useCallback, useEffect, useRef, useState } from 'react';
import { WorkDetails } from '@/components/layout/works-viewer/WorkDetails';
import { animated, useSpring } from '@react-spring/web';
import { useKeyboardEvent } from '@/hooks/use-keyboard-event';
import { FavoriteButton } from '@/components/layout/FavoriteButton';
import { Work } from '@/types/collection';

type TransitionState = 'preview' | 'transition' | 'fullscreen';

export const WorksViewer: FC = () => {
  const [selectedWork, setSelectedWork] = useState<Work>();
  const [fullscreenMode, setFullscreenMode] = useState<boolean>();
  const [transitionState, setTransitionState] = useState<TransitionState>('preview');
  const viewRef = useRef<HTMLDivElement>(null);
  const [viewTransitionStyles, viewAnimate] = useSpring(() => ({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  }));

  const toggleFullscreenMode = useCallback(
    () => setFullscreenMode((prev) => (selectedWork ? !prev : false)),
    [selectedWork],
  );

  useEffect(() => {
    if (!selectedWork) setFullscreenMode(undefined);
  }, [selectedWork]);

  useEffect(() => {
    const viewElement = viewRef.current;
    if (!viewElement || fullscreenMode === undefined) return;

    if (fullscreenMode) {
      viewAnimate.start({
        from: {
          x: 0,
          y: 0,
          width: viewElement.offsetWidth,
          height: viewElement.offsetHeight,
        },
        to: {
          x: -viewElement.getBoundingClientRect().x,
          y: -viewElement.getBoundingClientRect().y,
          width: window.innerWidth,
          height: window.innerHeight,
        },
        onStart: () => setTransitionState('transition'),
        onRest: () => setTransitionState('fullscreen'),
      });
    } else {
      viewAnimate.start({
        from: {
          x: -viewElement.getBoundingClientRect().x,
          y: -viewElement.getBoundingClientRect().y,
          width: window.innerWidth,
          height: window.innerHeight,
        },
        to: {
          x: 0,
          y: 0,
          width: viewElement.offsetWidth,
          height: viewElement.offsetHeight,
        },
        onStart: () => setTransitionState('transition'),
        onRest: () => setTransitionState('preview'),
      });
    }
  }, [fullscreenMode, viewAnimate]);

  useKeyboardEvent(
    'keyup',
    'KeyF',
    (e) => {
      if (document.activeElement?.tagName === 'INPUT') return;
      e.preventDefault();

      toggleFullscreenMode();
    },
    [toggleFullscreenMode],
  );

  return (
    <>
      <div className="grid size-full grid-cols-2 grid-rows-1 gap-2">
        <WorksList selectWork={setSelectedWork} />

        <div className="flex flex-col gap-2 py-2">
          <div ref={viewRef} className="grow">
            <animated.div
              style={transitionState === 'transition' ? viewTransitionStyles : undefined}
              className={
                transitionState === 'preview'
                  ? 'flex size-full flex-col'
                  : transitionState === 'fullscreen'
                    ? 'absolute left-0 top-0 flex size-full h-dvh w-screen flex-col'
                    : 'absolute z-30 flex flex-col'
              }
            >
              <WorkView work={selectedWork} fullscreenMode={fullscreenMode} />
            </animated.div>
          </div>
          <WorkDetails work={selectedWork} toggleFullscreenMode={toggleFullscreenMode} />
        </div>
      </div>

      {transitionState === 'fullscreen' && (
        <div className="absolute left-0 top-0 z-50 flex h-[20dvh] w-screen justify-center pt-2 opacity-0 transition-opacity hover:opacity-80">
          <button
            onClick={toggleFullscreenMode}
            tabIndex={-1}
            className="size-12 rounded-full border border-text/30 bg-background pb-1 text-center text-2xl shadow-lg hover:bg-text hover:text-background"
          >
            ×
          </button>
        </div>
      )}

      <div className="absolute bottom-2 left-2">
        <FavoriteButton />
      </div>
    </>
  );
};
