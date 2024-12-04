import { FC, useEffect, useRef, useState } from 'react';
import { useAnimateScroll, useCollection, useSearchQuery } from '@/hooks';
import { twMerge } from 'tailwind-merge';
import { Work } from '@/types/collection';
import { WorksListChunks } from './WorksListChunks';
import { WorksListSkeleton } from './WorksListSkeleton';

interface WorksListPanelProps {
  onSelectWork: (selectedWork: Work | null) => void;
  allowDeselect?: boolean;
}

export const WorksListPanel: FC<WorksListPanelProps> = ({ onSelectWork, allowDeselect }) => {
  const { searchQuery } = useSearchQuery();
  const { searchCollection, clearFavorites, isLoading } = useCollection();
  const [works, setWorks] = useState<Work[] | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const animateScroll = useAnimateScroll(scrollContainerRef);

  useEffect(() => {
    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;
    searchCollection(searchQuery).then((works) => !signal.aborted && setWorks(works));

    return () => abortControllerRef.current?.abort();
  }, [searchQuery, searchCollection]);

  return (
    <div className="-ml-3.5 flex min-h-0 grow flex-col">
      <div className="scroll-overflow-mask flex grow flex-col overflow-hidden">
        <div ref={scrollContainerRef} className="grow overflow-y-scroll pl-2 [direction:rtl]">
          <div
            className={twMerge(
              'flex min-h-full w-full flex-col gap-2 overflow-hidden py-2 [direction:ltr]',
              !works && 'h-full pb-0',
            )}
          >
            {works && (
              <WorksListChunks
                works={works}
                onSelectWork={onSelectWork}
                allowDeselect={allowDeselect}
                scrollContainerRef={scrollContainerRef}
                animateScroll={animateScroll}
              />
            )}

            {!works && <WorksListSkeleton isAnimated={isLoading} />}
          </div>
        </div>
      </div>

      {searchQuery === '#favorites' && (
        <button
          onClick={clearFavorites}
          className="pb-2 hover:text-text-accent hover:underline focus:text-text-accent focus:outline-none"
        >
          Clear favorites
        </button>
      )}
    </div>
  );
};
