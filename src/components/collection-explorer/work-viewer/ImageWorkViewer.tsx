import { FC, useCallback, useEffect, useState } from 'react';
import { useKeyboardEvent, useTimeout } from '@/hooks';
import { checkTextfieldFocused } from '@/utils/check-textfield-focused';
import { twMerge } from 'tailwind-merge';
import { Work } from '@/types/collection';
import { ImageView } from '@/components/common/ImageView';
import { convertFileSrc } from '@tauri-apps/api/core';

const SHOW_CONTROLS_DELAY = 1500;

export interface ImageWorkViewerProps {
  work: Work;
}

export const ImageWorkViewer: FC<ImageWorkViewerProps> = ({ work }) => {
  const [pageNumber, setPageNumber] = useState(0);
  const [controlsShown, setControlsShown] = useState(false);
  const [, updateShowControlsTimeout] = useTimeout();

  const showControls = useCallback(() => {
    setControlsShown(true);
    updateShowControlsTimeout(() => setControlsShown(false), SHOW_CONTROLS_DELAY);
  }, [updateShowControlsTimeout]);

  const showPreviousPage = useCallback(() => {
    if (!work?.imageAssets?.length) return;
    setPageNumber((prev) => (prev > 0 ? prev - 1 : work.imageAssets!.length - 1));
    showControls();
  }, [work?.imageAssets, showControls]);

  const showNextPage = useCallback(() => {
    if (!work?.imageAssets?.length) return;
    setPageNumber((prev) => (prev < work.imageAssets!.length - 1 ? prev + 1 : 0));
    showControls();
  }, [work?.imageAssets, showControls]);

  useKeyboardEvent(
    'keydown',
    ['PageUp', 'ArrowLeft', 'KeyA'],
    (e) => {
      if (checkTextfieldFocused()) return;
      e.preventDefault();
      showPreviousPage();
    },
    [showPreviousPage],
  );

  useKeyboardEvent(
    'keydown',
    ['PageDown', 'ArrowRight', 'KeyD'],
    (e) => {
      if (checkTextfieldFocused()) return;
      e.preventDefault();
      showNextPage();
    },
    [showNextPage],
  );

  useEffect(() => {
    setPageNumber(0);
  }, [work]);

  const asset = work.imageAssets[pageNumber];
  if (!asset) return null;

  return (
    <div
      onMouseMove={showControls}
      className={twMerge(
        'relative z-20 flex size-full grow basis-0 items-center justify-center overflow-hidden',
        !controlsShown && 'cursor-none',
      )}
    >
      <ImageView
        src={convertFileSrc(asset.path)}
        animateAsGif={asset.name.endsWith('.gif')}
        className="z-30 size-full"
      />

      <button
        className={twMerge(
          'absolute left-0 z-40 h-full w-1/3 max-w-60 p-4 text-left text-2xl text-white opacity-0 transition-opacity [background:radial-gradient(farthest-side_at_0_50%,#55556634,transparent_50%)] focus:outline-none',
          controlsShown ? 'hover:opacity-100' : 'cursor-none',
        )}
        tabIndex={-1}
        onClick={() => {
          setPageNumber((prev) => (prev > 0 ? prev - 1 : work.imageAssets!.length - 1));
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
          setPageNumber((prev) => (prev < work.imageAssets!.length - 1 ? prev + 1 : 0));
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
        {pageNumber + 1} / {work.imageAssets.length}
      </p>
    </div>
  );
};
