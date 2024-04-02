import { Work } from '@renderer/lib/Collection';
import { useState } from 'react';

interface WorkPreviewProps {
  work?: Work;
}
const WorkPreview = ({ work }: WorkPreviewProps) => {
  const [currentPage, setCurrentPage] = useState(0);

  return (
    <div className="relative my-2 flex items-center justify-center overflow-hidden rounded-xl border-2 border-text/30 shadow-lg">
      {work?.assets?.length ? (
        <>
          <img src={work.assets[currentPage]?.mediaPath} className="z-10 max-h-full max-w-full" />

          <div className="absolute flex h-full w-[9999px] justify-center">
            <img
              src={work.assets[currentPage]?.mediaPath}
              className="h-full blur-md [transform:scale(1.2)]"
            />
            <div className="absolute size-full bg-background/30" />
          </div>

          <button
            className="absolute left-0 z-20 h-full w-1/3 p-4 text-left text-3xl text-white opacity-0 transition-opacity [background:radial-gradient(farthest-side_at_0_50%,#33335544,transparent_50%)] hover:opacity-100"
            onClick={() =>
              setCurrentPage((prev) => (prev > 0 ? prev - 1 : work.assets!.length - 1))
            }
          >
            {'<'}
          </button>

          <button
            className="absolute right-0 z-20 h-full w-1/3 p-4 text-right text-3xl text-white opacity-0 transition-opacity [background:radial-gradient(farthest-side_at_100%_50%,#33335544,transparent_50%)] hover:opacity-100"
            onClick={() =>
              setCurrentPage((prev) => (prev < work.assets!.length - 1 ? prev + 1 : 0))
            }
          >
            {'>'}
          </button>

          <p className="absolute top-0 z-20 h-10 w-full text-center text-white opacity-0 transition-opacity [background:radial-gradient(farthest-side_at_50%_0,#33335555,transparent)] [:hover>&]:opacity-100">
            {currentPage + 1} / {work.assets.length}
          </p>
        </>
      ) : (
        <div />
      )}
    </div>
  );
};
export default WorkPreview;
