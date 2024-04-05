import useKeyboardEvent from '@renderer/hooks/useKeyboardEvent';
import useTimeout from '@renderer/hooks/useTimeout';
import { Work } from '@renderer/lib/Collection';
import { useEffect, useState } from 'react';

const showControlsDelay = 1500;

interface WorkViewProps {
  work: Work | undefined;
  fullscreenMode?: boolean;
}
const WorkView = ({ work, fullscreenMode }: WorkViewProps) => {
  const [pageNumber, setPageNumber] = useState(0);
  const [controlsShown, setControlsShown] = useState(false);
  const [, updateShowControlsTimeout] = useTimeout();

  const showControls = () => {
    setControlsShown(true);
    updateShowControlsTimeout(() => setControlsShown(false), showControlsDelay);
  };

  useKeyboardEvent(
    'keydown',
    ['ArrowLeft', 'KeyA'],
    async (e) => {
      if (document.activeElement?.tagName === 'INPUT') return;
      e.preventDefault();

      if (!work?.assets?.length) return;
      setPageNumber((prev) => (prev > 0 ? prev - 1 : work.assets!.length - 1));

      showControls();
    },
    [work, setPageNumber, setControlsShown, updateShowControlsTimeout],
  );

  useKeyboardEvent(
    'keydown',
    ['ArrowRight', 'KeyD'],
    async (e) => {
      if (document.activeElement?.tagName === 'INPUT') return;
      e.preventDefault();

      if (!work?.assets?.length) return;
      setPageNumber((prev) => (prev < work.assets!.length - 1 ? prev + 1 : 0));

      showControls();
    },
    [work, setPageNumber, setControlsShown, updateShowControlsTimeout],
  );

  useEffect(() => {
    setPageNumber(0);
  }, [work]);

  return (
    <div
      onMouseMove={showControls}
      className={
        'relative z-20 flex grow basis-0 items-center justify-center overflow-hidden shadow-lg transition-[border-radius] [transition-duration:1s]' +
        (!controlsShown ? ' cursor-none' : '') +
        (!fullscreenMode ? ' rounded-xl border-2 border-text/30' : '')
      }
    >
      {work?.assets?.length ? (
        <>
          <img src={work.assets[pageNumber]?.mediaPath} className="z-30 max-h-full max-w-full" />

          <div className="absolute z-20 flex size-full items-center justify-center">
            <img
              src={work.assets[pageNumber]?.mediaPath}
              className="w-full blur-md [transform:scale(1.3)]"
            />
            <div className="absolute size-full bg-background/30" />
          </div>

          <button
            className={
              'absolute left-0 z-40 h-full w-1/3 max-w-60 p-4 text-left text-2xl text-white opacity-0 transition-opacity [background:radial-gradient(farthest-side_at_0_50%,#55556634,transparent_50%)] focus:outline-none' +
              (controlsShown ? ' hover:opacity-100' : ' cursor-none')
            }
            tabIndex={-1}
            onClick={() => {
              setPageNumber((prev) => (prev > 0 ? prev - 1 : work.assets!.length - 1));
              showControls();
            }}
          >
            ❮
          </button>

          <button
            className={
              'absolute right-0 z-40 h-full w-1/3 max-w-60 p-4 text-right text-2xl text-white opacity-0 transition-opacity [background:radial-gradient(farthest-side_at_100%_50%,#55556634,transparent_50%)] focus:outline-none' +
              (controlsShown ? ' hover:opacity-100' : ' cursor-none')
            }
            tabIndex={-1}
            onClick={() => {
              setPageNumber((prev) => (prev < work.assets!.length - 1 ? prev + 1 : 0));
              showControls();
            }}
          >
            ❯
          </button>

          <p
            className={
              'absolute top-0 z-40 h-10 w-full text-center text-white transition-opacity [background:radial-gradient(farthest-side_at_50%_0,#55556634,transparent)]' +
              (controlsShown ? ' opacity-100' : ' opacity-0')
            }
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
export default WorkView;
