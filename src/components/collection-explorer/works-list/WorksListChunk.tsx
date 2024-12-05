import { Work } from '@/types/collection';
import { FC, memo, RefObject, useEffect, useRef, useState } from 'react';
import { WorksListCard } from './WorksListCard';
import { AnimateScroll } from '@/hooks/use-animate-scroll';

const ROOT_MARGIN = '500px';

export interface WorksListChunkProps {
  works: Work[];
  chunkStartIndex: number;
  selectedLocalIndex: number | null;
  onSelectGlobalIndex: (selectedWork: number) => void;
  scrollContainerRef: RefObject<HTMLDivElement>;
  animateScroll: AnimateScroll;
  forceRender?: boolean;
}

export const WorksListChunk: FC<WorksListChunkProps> = memo(
  ({
    works,
    chunkStartIndex,
    selectedLocalIndex,
    onSelectGlobalIndex,
    scrollContainerRef,
    animateScroll,
    forceRender,
  }) => {
    const [inViewport, setInViewport] = useState(false);
    const elementHeightRef = useRef<number | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      const observer = new IntersectionObserver(
        (entries) => {
          setInViewport(entries[0]?.isIntersecting ?? false);
          elementHeightRef.current = containerRef.current?.offsetHeight ?? null;
        },
        { rootMargin: ROOT_MARGIN },
      );
      observer.observe(containerRef.current!);

      return () => observer.disconnect();
    }, [inViewport]);

    const chunkSize = works.length;
    const fallbackHeight = chunkSize * 8 + 'rem';

    return (
      <div ref={containerRef} className="flex flex-col gap-2">
        {inViewport || forceRender ? (
          works.map((work, workIndexInChunk) => {
            const workGlobalIndex = chunkStartIndex + workIndexInChunk;
            const selectedGlobalIndex =
              selectedLocalIndex !== null ? chunkStartIndex + selectedLocalIndex : null;

            return (
              <WorksListCard
                key={work.key}
                work={work}
                index={workGlobalIndex}
                onSelectIndex={onSelectGlobalIndex}
                scrollContainerRef={scrollContainerRef}
                animateScroll={animateScroll}
                selected={workGlobalIndex === selectedGlobalIndex}
              />
            );
          })
        ) : (
          <div style={{ height: elementHeightRef.current ?? fallbackHeight }} />
        )}
      </div>
    );
  },
);
