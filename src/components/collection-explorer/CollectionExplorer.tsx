import { FC, useEffect, useRef, useState } from 'react';
import { animated } from '@react-spring/web';
import { useKeyboardEvent, useFullscreen } from '@/hooks';
import { checkTextfieldFocused } from '@/utils/is-textfield-focused';
import { Work } from '@/types/collection';

import { WorksList } from './WorksList';
import { WorkViewer } from './WorkViewer';
import { WorkDetailsAccordion } from './WorkDetailsAccordion';
import { ExitFullscreenButton } from '@/components/collection-explorer/ExitFullscreenButton';
import { OperationOutputAccordion } from '@/components/collection-explorer/OperationOutputAccordion';

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
      <main className="grid size-full grow grid-cols-2 grid-rows-1 gap-2 overflow-hidden px-[10%]">
        <div className="flex flex-col py-2">
          <WorksList onSelectWork={setSelectedWork} allowDeselect={fullscreenState === 'normal'} />
          <OperationOutputAccordion />
        </div>

        <div className="flex flex-col gap-2 py-2">
          <div ref={viewerRef} className="grow">
            <animated.div style={fullscreenStyles} className="flex flex-col">
              <WorkViewer work={selectedWork} fullscreenState={fullscreenState} />
            </animated.div>
          </div>

          <WorkDetailsAccordion work={selectedWork} onToggleFullscreen={toggleFullscreen} />
        </div>
      </main>

      {fullscreenState === 'fullscreen' && <ExitFullscreenButton onClick={exitFullscreen} />}
    </>
  );
};
