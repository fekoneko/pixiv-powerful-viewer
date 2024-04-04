import useKeyboardEvent from '@renderer/hooks/useKeyboardEvent';
import useTimeout from '@renderer/hooks/useTimeout';
import { Work } from '@renderer/lib/Collection';
import { useEffect, useState } from 'react';

const pageNumberShowDelay = 1000;

interface WorkPreviewProps {
  work: Work | undefined;
}
const WorkPreview = ({ work }: WorkPreviewProps) => {
  const [pageNumber, setPageNumber] = useState(0);
  const [showPageNumber, setShowPageNumber] = useState(false);
  const [, updateShowPageNumberTimeout] = useTimeout();

  useKeyboardEvent(
    'keydown',
    ['ArrowLeft', 'KeyA'],
    async (e) => {
      if (document.activeElement?.tagName === 'INPUT') return;
      e.preventDefault();

      if (!work?.assets?.length) return;
      setPageNumber((prev) => (prev > 0 ? prev - 1 : work.assets!.length - 1));

      setShowPageNumber(true);
      updateShowPageNumberTimeout(() => setShowPageNumber(false), pageNumberShowDelay);
    },
    [work, setPageNumber],
  );

  useKeyboardEvent(
    'keydown',
    ['ArrowRight', 'KeyD'],
    async (e) => {
      if (document.activeElement?.tagName === 'INPUT') return;
      e.preventDefault();

      if (!work?.assets?.length) return;
      setPageNumber((prev) => (prev < work.assets!.length - 1 ? prev + 1 : 0));

      setShowPageNumber(true);
      updateShowPageNumberTimeout(() => setShowPageNumber(false), pageNumberShowDelay);
    },
    [work, setPageNumber],
  );

  useEffect(() => {
    setPageNumber(0);
  }, [work]);

  return (
    <div className="relative flex grow basis-0 items-center justify-center overflow-hidden rounded-xl border-2 border-text/30 shadow-lg">
      {work?.assets?.length ? (
        <>
          <img src={work.assets[pageNumber]?.mediaPath} className="z-10 max-h-full max-w-full" />

          <div className="absolute flex h-full w-[9999px] justify-center">
            <img
              src={work.assets[pageNumber]?.mediaPath}
              className="h-full blur-md [transform:scale(1.3)]"
            />
            <div className="absolute size-full bg-background/30" />
          </div>

          <button
            className="absolute left-0 z-20 h-full w-1/3 p-4 text-left text-2xl text-white opacity-0 transition-opacity [background:radial-gradient(farthest-side_at_0_50%,#33335544,transparent_50%)] hover:opacity-100"
            tabIndex={-1}
            onClick={() => setPageNumber((prev) => (prev > 0 ? prev - 1 : work.assets!.length - 1))}
          >
            ❮
          </button>

          <button
            className="absolute right-0 z-20 h-full w-1/3 p-4 text-right text-2xl text-white opacity-0 transition-opacity [background:radial-gradient(farthest-side_at_100%_50%,#33335544,transparent_50%)] hover:opacity-100"
            tabIndex={-1}
            onClick={() => setPageNumber((prev) => (prev < work.assets!.length - 1 ? prev + 1 : 0))}
          >
            ❯
          </button>

          <p
            className={
              'absolute top-0 z-20 h-10 w-full text-center text-white transition-opacity [background:radial-gradient(farthest-side_at_50%_0,#33335555,transparent)] [:hover>&]:opacity-100' +
              (showPageNumber ? ' opacity-100' : ' opacity-0')
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
export default WorkPreview;
