import { FC, RefObject, memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useKeyboardEvent, useTimeout, useAnimateScroll, useCollection, useSearch } from '@/hooks';
import { isTextfieldFocused } from '@/utils/is-textfield-focused';
import { AnimateScroll } from '@/hooks/use-animate-scroll';
import { Work } from '@/types/collection';

import { WorkCard } from './WorkCard';
import { RenderInViewport } from './RenderInViewport';

const workCardChunkSize = 20;
const keyboardSelectionDelay = 150;

interface WorkListCardsProps {
  works: Work[];
  onSelectWork: (selectedWork: Work | undefined) => void;
  scrollContainerRef: RefObject<HTMLDivElement>;
  animateScroll: AnimateScroll;
}

const WorkListCards: FC<WorkListCardsProps> = memo(
  ({ works, onSelectWork, scrollContainerRef, animateScroll }) => {
    const workCardsChunks = useMemo(() => {
      const result: Work[][] = [];
      for (let i = 0; i < works.length; i += workCardChunkSize) {
        result.push(works.slice(i, i + workCardChunkSize));
      }
      return result;
    }, [works]);

    const [selectedIndex, setSelectedIndex] = useState<number>();
    const canSelectWithKeyboardRef = useRef(true);
    const [, updateKeyboardSelectionTimeout] = useTimeout();

    useEffect(() => {
      onSelectWork(selectedIndex !== undefined ? works[selectedIndex] : undefined);
    }, [selectedIndex, onSelectWork, works]);

    useEffect(() => {
      setSelectedIndex((prev) =>
        prev === undefined || works.length === 0
          ? undefined
          : prev > works.length - 1
            ? works.length - 1
            : prev,
      );
    }, [works]);

    useEffect(() => {
      if (selectedIndex === undefined) animateScroll.start({ y: 0, immediate: true });
    }, [selectedIndex, animateScroll]);

    const ensureCanSelectWithKeyboard = useCallback(() => {
      if (!canSelectWithKeyboardRef.current) return false;

      canSelectWithKeyboardRef.current = false;
      updateKeyboardSelectionTimeout(
        () => (canSelectWithKeyboardRef.current = true),
        keyboardSelectionDelay,
      );
      return true;
    }, [updateKeyboardSelectionTimeout, canSelectWithKeyboardRef]);

    useKeyboardEvent(
      'keydown',
      ['ArrowUp', 'KeyW'],
      (e) => {
        if (isTextfieldFocused()) return;
        e.preventDefault();

        if (!ensureCanSelectWithKeyboard()) return;

        setSelectedIndex((prev) => {
          if (prev === undefined) return 0;
          return prev <= 0 ? 0 : prev - 1;
        });
      },
      [ensureCanSelectWithKeyboard],
      { control: false },
    );

    useKeyboardEvent(
      'keydown',
      ['ArrowDown', 'KeyS'],
      (e) => {
        if (isTextfieldFocused()) return;
        e.preventDefault();

        if (!ensureCanSelectWithKeyboard()) return;

        setSelectedIndex((prev) => {
          if (prev === undefined) return 0;
          return prev + 1 >= works.length - 1 ? works.length - 1 : prev + 1;
        });
      },
      [works.length, ensureCanSelectWithKeyboard],
      { control: false },
    );

    useKeyboardEvent(
      'keydown',
      'Escape',
      (e) => {
        if (isTextfieldFocused()) return;
        e.preventDefault();

        setSelectedIndex(undefined);
      },
      [],
    );

    return (
      <>
        {workCardsChunks.map((chunk, chunkIndex) => (
          <RenderInViewport
            key={chunkIndex}
            fallbackHeight={chunk.length * 8 + 'rem'}
            forceRender={
              selectedIndex !== undefined &&
              selectedIndex >= (chunkIndex - 1) * workCardChunkSize &&
              selectedIndex <= (chunkIndex + 1) * workCardChunkSize
            }
            className="flex flex-col gap-2"
          >
            {chunk.map((work, workIndexInChunk) => {
              const workIndex = chunkIndex * workCardChunkSize + workIndexInChunk;
              return (
                <WorkCard
                  key={work.relativePath}
                  work={work}
                  index={workIndex}
                  onSelect={setSelectedIndex}
                  scrollContainerRef={scrollContainerRef}
                  animateScroll={animateScroll}
                  active={workIndex === selectedIndex}
                />
              );
            })}
          </RenderInViewport>
        ))}
      </>
    );
  },
);

interface WorksListProps {
  onSelectWork: (selectedWork: Work | undefined) => void;
}

export const WorksList: FC<WorksListProps> = ({ onSelectWork }) => {
  const { search } = useSearch();
  const { searchCollection, clearFavorites } = useCollection();
  const works = useMemo(() => searchCollection(search), [search, searchCollection]);

  const [scrolledToTheTop, setScrolledToTheTop] = useState(true);
  const [scrolledToTheBottom, setScrolledToTheBottom] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const animateScroll = useAnimateScroll(scrollContainerRef);

  return (
    <div className="flex flex-col">
      <div
        className={
          (!scrolledToTheTop ? 'work-list-gradient-top ' : '') +
          (!scrolledToTheBottom ? 'work-list-gradient-bottom ' : '') +
          'flex grow flex-col overflow-hidden'
        }
      >
        <div
          ref={scrollContainerRef}
          className="grow overflow-y-scroll pl-2 [direction:rtl]"
          onScroll={(e) => {
            const target = e.target as HTMLDivElement;
            if (target.scrollTop < 10) setScrolledToTheTop(true);
            else setScrolledToTheTop(false);
            if (target.scrollTop + target.getBoundingClientRect().height > target.scrollHeight - 10)
              setScrolledToTheBottom(true);
            else setScrolledToTheBottom(false);
          }}
        >
          <div className="flex flex-col gap-2 py-2 [direction:ltr]">
            <WorkListCards
              works={works ?? []}
              onSelectWork={onSelectWork}
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
