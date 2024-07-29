import { FC, UIEvent, useMemo, useRef, useState } from 'react';
import { useAnimateScroll, useCollection, useSearch } from '@/hooks';
import { twMerge } from 'tailwind-merge';
import { Work } from '@/types/collection';

import { WorkListChunks } from '@/components/collection-explorer/WorkListChunks';

interface WorksListProps {
  onSelectWork: (selectedWork: Work | null) => void;
  allowDeselect?: boolean;
}

export const WorksList: FC<WorksListProps> = ({ onSelectWork, allowDeselect }) => {
  const { search } = useSearch();
  const { searchCollection, clearFavorites } = useCollection();
  const works = useMemo(() => searchCollection(search), [search, searchCollection]);

  const [scrolledToTheTop, setScrolledToTheTop] = useState(true);
  const [scrolledToTheBottom, setScrolledToTheBottom] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const animateScroll = useAnimateScroll(scrollContainerRef);

  const onScroll = (e: UIEvent<HTMLDivElement>) => {
    const target = e.target as HTMLDivElement;

    if (target.scrollTop < 10) setScrolledToTheTop(true);
    else setScrolledToTheTop(false);

    if (target.scrollTop + target.getBoundingClientRect().height > target.scrollHeight - 10)
      setScrolledToTheBottom(true);
    else setScrolledToTheBottom(false);
  };

  return (
    <div className="-ml-4 flex min-h-0 grow flex-col">
      <div
        className={twMerge(
          !scrolledToTheTop && 'work-list-gradient-top',
          !scrolledToTheBottom && 'work-list-gradient-bottom',
          'flex grow flex-col overflow-hidden',
        )}
      >
        <div
          ref={scrollContainerRef}
          className="grow overflow-y-scroll pl-2 [direction:rtl]"
          onScroll={onScroll}
        >
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

      {search === '#favorites' && (
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
