import { FC, RefObject, memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useKeyboardEvent, useTimeout, useAnimateScroll, useCollection, useSearch } from '@/hooks';
import { isTextfieldFocused } from '@/utils/is-textfield-focused';
import { AnimateScroll } from '@/hooks/use-animate-scroll';
import { twMerge } from 'tailwind-merge';
import { Work } from '@/types/collection';

import { WorkCard } from './WorkCard';
import { RenderInViewport } from './RenderInViewport';

const workCardChunkSize = 20;
const keyboardSelectionDelay = 150;

interface WorkListCardsProps {
  works: Work[];
  onSelectWork: (selectedWork: Work | null) => void;
  allowDeselect?: boolean;
  scrollContainerRef: RefObject<HTMLDivElement>;
  animateScroll: AnimateScroll;
}

const WorkListCards: FC<WorkListCardsProps> = memo(
  ({ works, onSelectWork, allowDeselect, scrollContainerRef, animateScroll }) => {
    const workCardsChunks = useMemo(() => {
      const result: Work[][] = [];
      for (let i = 0; i < works.length; i += workCardChunkSize) {
        result.push(works.slice(i, i + workCardChunkSize));
      }
      return result;
    }, [works]);

    const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
    const canSelectWithKeyboardRef = useRef(true);
    const [, updateKeyboardSelectionTimeout] = useTimeout();

    useEffect(() => {
      onSelectWork(selectedIndex !== null ? (works[selectedIndex] ?? null) : null);
    }, [selectedIndex, onSelectWork, works]);

    useEffect(() => {
      setSelectedIndex((prev) =>
        prev === null || works.length === 0
          ? null
          : prev > works.length - 1
            ? works.length - 1
            : prev,
      );
    }, [works]);

    useEffect(() => {
      if (selectedIndex === null) animateScroll.start({ y: 0, immediate: true });
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
          if (prev === null) return 0;
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
          if (prev === null) return 0;
          return prev + 1 >= works.length - 1 ? works.length - 1 : prev + 1;
        });
      },
      [works.length, ensureCanSelectWithKeyboard],
      { control: false },
    );

    useKeyboardEvent('keydown', 'Escape', (e) => {
      if (!allowDeselect || isTextfieldFocused()) return;
      e.preventDefault();

      setSelectedIndex(null);
    });

    return (
      <>
        {workCardsChunks.map((chunk, chunkIndex) => (
          <RenderInViewport
            key={chunkIndex}
            fallbackHeight={chunk.length * 8 + 'rem'}
            forceRender={
              selectedIndex !== null &&
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

  return (
    <div className="flex flex-col">
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
