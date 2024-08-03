import { FC, useEffect, useRef, useState } from 'react';
import { useAnimateScroll, useCollection, useSearchQuery } from '@/hooks';
import { Work } from '@/types/collection';

import { WorkListChunks } from './WorkListChunks';

interface WorksListProps {
  onSelectWork: (selectedWork: Work | null) => void;
  allowDeselect?: boolean;
}

export const WorksList: FC<WorksListProps> = ({ onSelectWork, allowDeselect }) => {
  const { searchQuery } = useSearchQuery();
  const { searchCollection, clearFavorites } = useCollection();
  const [works, setWorks] = useState<Work[] | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const animateScroll = useAnimateScroll(scrollContainerRef);

  useEffect(() => {
    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;
    searchCollection(searchQuery).then((works) => !signal.aborted && setWorks(works));
    // TODO: maybe handle loading state

    return () => abortControllerRef.current?.abort();
  }, [searchQuery, searchCollection]);

  return (
    <div className="-ml-3.5 flex min-h-0 grow flex-col">
      <div className="work-list-mask flex grow flex-col overflow-hidden">
        <div ref={scrollContainerRef} className="grow overflow-y-scroll pl-2 [direction:rtl]">
          <div className="flex flex-col gap-2 py-2 [direction:ltr]">
            <WorkListChunks
              works={works ?? []}
              onSelectWork={onSelectWork}
              allowDeselect={allowDeselect}
              scrollContainerRef={scrollContainerRef}
              animateScroll={animateScroll}
            />
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
