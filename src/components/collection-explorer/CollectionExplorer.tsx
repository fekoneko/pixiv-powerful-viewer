import { FC, useEffect, useRef, useState } from 'react';
import { animated } from '@react-spring/web';
import { useKeyboardEvent, useFullscreen } from '@/hooks';
import { checkTextfieldFocused } from '@/utils/is-textfield-focused';
import { Work } from '@/types/collection';

import { WorksListPanel } from './WorksListPanel';
import { WorkViewerPanel } from './WorkViewerPanel';
import { WorkDetailsAccordion } from './WorkDetailsAccordion';
import { ExitFullscreenButton } from './ExitFullscreenButton';
import { OutputAccordion } from './OutputAccordion';

export const CollectionExplorer: FC = () => {
  const [selectedWork, setSelectedWork] = useState<Work | null>(null);
  const viewerRef = useRef<HTMLDivElement>(null);
  const { fullscreenState, fullscreenStyles, exitFullscreen, toggleFullscreen } =
    useFullscreen(viewerRef);

  useKeyboardEvent(
    'keydown',
    'KeyF',
    () => {
      if (checkTextfieldFocused() || !selectedWork) return;
      toggleFullscreen();
    },
    [toggleFullscreen],
  );

  useKeyboardEvent(
    'keydown',
    'Escape',
    () => {
      if (checkTextfieldFocused() || fullscreenState === 'normal') return;
      exitFullscreen();
    },
    [exitFullscreen],
  );

  useEffect(() => {
    if (!selectedWork) exitFullscreen();
  }, [selectedWork, exitFullscreen]);

  return (
    <>
      <main className="-ml-3.5 grid h-full w-[calc(100%+0.875rem)] grid-cols-2 grid-rows-1 gap-3 overflow-hidden">
        <div className="ml-3.5 flex flex-col">
          <WorksListPanel
            onSelectWork={setSelectedWork}
            allowDeselect={fullscreenState === 'normal'}
          />
          <OutputAccordion />
        </div>

        <div className="flex flex-col">
          <div ref={viewerRef} className="my-2 grow">
            <animated.div style={fullscreenStyles} className="flex flex-col">
              <WorkViewerPanel work={selectedWork} fullscreenState={fullscreenState} />
            </animated.div>
          </div>

          <WorkDetailsAccordion work={selectedWork} onToggleFullscreen={toggleFullscreen} />
        </div>
      </main>

      {fullscreenState === 'fullscreen' && <ExitFullscreenButton onClick={exitFullscreen} />}
    </>
  );
};
