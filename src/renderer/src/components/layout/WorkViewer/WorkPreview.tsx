import { Work } from '@renderer/lib/Collection';
import { useState } from 'react';

interface WorkPreviewProps {
  work?: Work;
}
const WorkPreview = ({ work }: WorkPreviewProps) => {
  const [currentPage, setCurrentPage] = useState(0);

  return (
    <div className="rounded-xl relative border-2 border-text/30 my-2 shadow-lg overflow-hidden flex items-center justify-center">
      {work?.assets?.length ? (
        <>
          <img src={work.assets[currentPage]?.mediaPath} className="max-w-full max-h-full" />
          <button
            className="absolute left-0 text-3xl p-4 h-full text-white"
            onClick={() =>
              setCurrentPage((prev) => (prev > 0 ? prev - 1 : work.assets!.length - 1))
            }
          >
            {'<'}
          </button>
          <button
            className="absolute right-0 text-3xl p-4 h-full text-white"
            onClick={() =>
              setCurrentPage((prev) => (prev < work.assets!.length - 1 ? prev + 1 : 0))
            }
          >
            {'>'}
          </button>
          <p className="absolute top-0 text-white">
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
