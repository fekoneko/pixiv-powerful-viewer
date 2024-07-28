import { FC, useEffect, useRef, useState } from 'react';
import { animated } from '@react-spring/web';
import { useKeyboardEvent, useFullscreen } from '@/hooks';
import { isTextfieldFocused } from '@/utils/is-textfield-focused';
import { Work } from '@/types/collection';

import { WorksList } from './WorksList';
import { WorkViewer } from './WorkViewer';
import { WorkDetails } from './WorkDetails';
import { ExitFullscreenButton } from '@/components/collection-explorer/ExitFullscreenButton';

export const CollectionExplorer: FC = () => {
  const [selectedWork, setSelectedWork] = useState<Work | null>(null);
  const viewerRef = useRef<HTMLDivElement>(null);
  const { fullscreenState, fullscreenStyles, exitFullscreen, toggleFullscreen } =
    useFullscreen(viewerRef);

  useKeyboardEvent(
    'keydown',
    'KeyF',
    (e) => {
      if (!selectedWork || isTextfieldFocused()) return;
      e.preventDefault();

      toggleFullscreen();
    },
    [toggleFullscreen],
  );

  useKeyboardEvent(
    'keydown',
    'Escape',
    (e) => {
      if (fullscreenState === 'normal' || isTextfieldFocused()) return;
      e.preventDefault();

      exitFullscreen();
    },
    [exitFullscreen],
  );

  useEffect(() => {
    if (!selectedWork) exitFullscreen();
  }, [selectedWork, exitFullscreen]);

  return (
    <>
      <main className="grid size-full grow grid-cols-2 grid-rows-1 gap-2 overflow-hidden pl-[calc(10%-1rem)] pr-[10%]">
        <WorksList onSelectWork={setSelectedWork} allowDeselect={fullscreenState === 'normal'} />

        <div className="flex flex-col gap-2 py-2">
          <div ref={viewerRef} className="grow">
            <animated.div style={fullscreenStyles} className="flex flex-col">
              <WorkViewer work={selectedWork} fullscreenState={fullscreenState} />
            </animated.div>
          </div>

          <WorkDetails work={selectedWork} onToggleFullscreen={toggleFullscreen} />
        </div>
      </main>

      {fullscreenState === 'fullscreen' && <ExitFullscreenButton onClick={exitFullscreen} />}
    </>
  );
};
