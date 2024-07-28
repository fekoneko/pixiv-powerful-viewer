import { FC, useCallback, useEffect, useState } from 'react';
import { useKeyboardEvent, useTimeout } from '@/hooks';
import { FullscreenState } from '@/hooks/use-fullscreen';
import { isTextfieldFocused } from '@/utils/is-textfield-focused';
import { Work } from '@/types/collection';

import { ImageView } from './ImageView';
import { twMerge } from 'tailwind-merge';

const showControlsDelay = 1500;

interface WorkViewProps {
  work: Work | null;
  fullscreenState: FullscreenState;
}

export const WorkViewer: FC<WorkViewProps> = ({ work, fullscreenState }) => {
  const [pageNumber, setPageNumber] = useState(0);
  const [controlsShown, setControlsShown] = useState(false);
  const [, updateShowControlsTimeout] = useTimeout();

  const showControls = useCallback(() => {
    setControlsShown(true);
    updateShowControlsTimeout(() => setControlsShown(false), showControlsDelay);
  }, [updateShowControlsTimeout]);

  useKeyboardEvent(
    'keydown',
    ['ArrowLeft', 'KeyA'],
    async (e) => {
      if (isTextfieldFocused()) return;
      e.preventDefault();

      if (!work?.assets?.length) return;
      setPageNumber((prev) => (prev > 0 ? prev - 1 : work.assets!.length - 1));

      showControls();
    },
    [work, showControls],
  );

  useKeyboardEvent(
    'keydown',
    ['ArrowRight', 'KeyD'],
    async (e) => {
      if (isTextfieldFocused()) return;
      e.preventDefault();

      if (!work?.assets?.length) return;
      setPageNumber((prev) => (prev < work.assets!.length - 1 ? prev + 1 : 0));

      showControls();
    },
    [work, showControls],
  );

  useEffect(() => {
    setPageNumber(0);
  }, [work]);

  return (
    <div
      onMouseMove={showControls}
      className={twMerge(
        'relative z-20 flex grow basis-0 items-center justify-center overflow-hidden shadow-lg',
        fullscreenState === 'normal' && 'rounded-xl border-2 border-text/30',
        fullscreenState === 'transition' && 'rounded-xl',
        work && !controlsShown && 'cursor-none',
      )}
    >
      {work?.assets?.length && work.assets[pageNumber] ? (
        <>
          <ImageView asset={work.assets[pageNumber]} className="z-30 size-full" />

          <div className="absolute z-20 flex size-full items-center justify-center">
            <div className="absolute size-full bg-background" />
            <ImageView
              asset={work.assets[pageNumber]}
              className="size-full scale-[3] blur-[0.4rem]"
            />
            <div className="absolute size-full bg-background/40" />
          </div>

          <button
            className={twMerge(
              'absolute left-0 z-40 h-full w-1/3 max-w-60 p-4 text-left text-2xl text-white opacity-0 transition-opacity [background:radial-gradient(farthest-side_at_0_50%,#55556634,transparent_50%)] focus:outline-none',
              controlsShown ? 'hover:opacity-100' : 'cursor-none',
            )}
            tabIndex={-1}
            onClick={() => {
              setPageNumber((prev) => (prev > 0 ? prev - 1 : work.assets!.length - 1));
              showControls();
            }}
          >
            ❮
          </button>

          <button
            className={twMerge(
              'absolute right-0 z-40 h-full w-1/3 max-w-60 p-4 text-right text-2xl text-white opacity-0 transition-opacity [background:radial-gradient(farthest-side_at_100%_50%,#55556634,transparent_50%)] focus:outline-none',
              controlsShown ? 'hover:opacity-100' : 'cursor-none',
            )}
            tabIndex={-1}
            onClick={() => {
              setPageNumber((prev) => (prev < work.assets!.length - 1 ? prev + 1 : 0));
              showControls();
            }}
          >
            ❯
          </button>

          <p
            className={twMerge(
              'absolute top-0 z-40 h-10 w-full text-center text-white transition-opacity [background:radial-gradient(farthest-side_at_50%_0,#55556634,transparent)]',
              controlsShown ? 'opacity-100' : 'opacity-0',
            )}
          >
            {pageNumber + 1} / {work.assets.length}
          </p>
        </>
      ) : (
        <div />
      )}
    </div>
  );
};
