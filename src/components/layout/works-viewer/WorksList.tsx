import {
  FC,
  RefObject,
  memo,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { SearchContext } from '@/contexts/SearchContext';
import { useKeyboardEvent } from '@/hooks/use-keyboard-event';
import { WorkCard } from '@/components/layout/works-viewer/WorkCard';
import { RenderInViewport } from '@/components/render/RenderInViewport';
import { useTimeout } from '@/hooks/use-timeout';
import { useAnimateScroll, AnimateScroll } from '@/hooks/use-animate-scroll';
import { Work } from '@/types/collection';
import { useCollection } from '@/hooks/use-collection';

const workCardChunkSize = 20;
const keyboardSelectionDelay = 150;

interface WorkListCardsProps {
  works: Work[];
  selectWork: (selectedWork: Work | undefined) => void;
  scrollContainerRef: RefObject<HTMLDivElement>;
  animateScroll: AnimateScroll;
}

const WorkListCards: FC<WorkListCardsProps> = memo(
  ({ works, selectWork, scrollContainerRef, animateScroll }) => {
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
      selectWork(selectedIndex !== undefined ? works[selectedIndex] : undefined);
    }, [selectedIndex, selectWork, works]);

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
        if (document.activeElement?.tagName === 'INPUT') return;
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
        if (document.activeElement?.tagName === 'INPUT') return;
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
        if (document.activeElement?.tagName === 'INPUT') return;
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
                  selectIndex={setSelectedIndex}
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
  selectWork: (selectedWork: Work | undefined) => void;
}

export const WorksList: FC<WorksListProps> = ({ selectWork }) => {
  const { search } = useContext(SearchContext);
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
              selectWork={selectWork}
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
