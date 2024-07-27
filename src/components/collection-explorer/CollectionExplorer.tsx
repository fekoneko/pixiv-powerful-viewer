import { FC, useCallback, useEffect, useRef, useState } from 'react';
import { animated, useSpring } from '@react-spring/web';
import { useKeyboardEvent } from '@/hooks';
import { isTextfieldFocused } from '@/utils/is-textfield-focused';
import { Work } from '@/types/collection';

import { WorksList } from './WorksList';
import { WorkViewer } from './WorkViewer';
import { WorkDetails } from './WorkDetails';

type TransitionState = 'preview' | 'transition' | 'fullscreen';

export const CollectionExplorer: FC = () => {
  const [selectedWork, setSelectedWork] = useState<Work>();
  const [fullscreenMode, setFullscreenMode] = useState<boolean>();
  const [transitionState, setTransitionState] = useState<TransitionState>('preview');
  const viewerRef = useRef<HTMLDivElement>(null);
  const [viewerTransitionStyles, viewerAnimate] = useSpring(() => ({
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
    const viewerElement = viewerRef.current;
    if (!viewerElement || fullscreenMode === undefined) return;

    if (fullscreenMode) {
      viewerAnimate.start({
        from: {
          x: 0,
          y: 0,
          width: viewerElement.offsetWidth,
          height: viewerElement.offsetHeight,
        },
        to: {
          x: -viewerElement.getBoundingClientRect().x,
          y: -viewerElement.getBoundingClientRect().y,
          width: window.innerWidth,
          height: window.innerHeight,
        },
        onStart: () => setTransitionState('transition'),
        onRest: () => setTransitionState('fullscreen'),
      });
    } else {
      viewerAnimate.start({
        from: {
          x: -viewerElement.getBoundingClientRect().x,
          y: -viewerElement.getBoundingClientRect().y,
          width: window.innerWidth,
          height: window.innerHeight,
        },
        to: {
          x: 0,
          y: 0,
          width: viewerElement.offsetWidth,
          height: viewerElement.offsetHeight,
        },
        onStart: () => setTransitionState('transition'),
        onRest: () => setTransitionState('preview'),
      });
    }
  }, [fullscreenMode, viewerAnimate]);

  useKeyboardEvent(
    'keyup',
    'KeyF',
    (e) => {
      if (isTextfieldFocused()) return;
      e.preventDefault();

      toggleFullscreenMode();
    },
    [toggleFullscreenMode],
  );

  return (
    <>
      <main className="grid size-full grow grid-cols-2 grid-rows-1 gap-2 overflow-hidden pl-[calc(10%-1rem)] pr-[10%]">
        <WorksList onSelectWork={setSelectedWork} />

        <div className="flex flex-col gap-2 py-2">
          <div ref={viewerRef} className="grow">
            <animated.div
              style={transitionState === 'transition' ? viewerTransitionStyles : undefined}
              className={
                transitionState === 'preview'
                  ? 'flex size-full flex-col'
                  : transitionState === 'fullscreen'
                    ? 'absolute left-0 top-0 flex size-full h-dvh w-screen flex-col'
                    : 'absolute z-30 flex flex-col'
              }
            >
              <WorkViewer work={selectedWork} fullscreenMode={fullscreenMode} />
            </animated.div>
          </div>
          <WorkDetails work={selectedWork} onToggleFullscreen={toggleFullscreenMode} />
        </div>
      </main>

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
    </>
  );
};
