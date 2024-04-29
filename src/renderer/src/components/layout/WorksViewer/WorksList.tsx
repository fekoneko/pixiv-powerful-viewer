import useWorks from '../../../hooks/useWorks';
import { memo, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Work } from '@renderer/lib/Collection';
import SearchContext from '@renderer/contexts/SearchContext';
import useKeyboardEvent from '@renderer/hooks/useKeyboardEvent';
import WorkCard from './WorkCard';
import RenderInViewport from '@renderer/components/render/RenderInViewport';
import useTimeout from '@renderer/hooks/useTimeout';
import useAnimateScroll, { AnimateScroll } from '@renderer/hooks/useAnimateScroll';
import { FavoriteWorksContext } from '@renderer/contexts/FavoriteWorksContext';

const workCardChunkSize = 20;
const keyboardSelectionDelay = 150;

interface WorkListCardsProps {
  works: Work[];
  selectWork: (selectedWork: Work | undefined) => any;
  scrollContainerRef: React.RefObject<HTMLDivElement>;
  animateScroll: AnimateScroll;
}
const WorkListCards = memo(
  ({ works, selectWork, scrollContainerRef, animateScroll }: WorkListCardsProps) => {
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
    }, [selectedIndex, selectWork]);

    useEffect(() => {
      setSelectedIndex(undefined);
      animateScroll.start({ y: 0, immediate: true });
    }, [works, setSelectedIndex, animateScroll]);

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
      [setSelectedIndex, ensureCanSelectWithKeyboard],
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
      [works.length, setSelectedIndex, ensureCanSelectWithKeyboard],
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
      [setSelectedIndex],
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
                  key={work.path}
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
  selectWork: (selectedWork: Work | undefined) => any;
}
const WorksList = ({ selectWork }: WorksListProps) => {
  const { search } = useContext(SearchContext);
  const { favoriteWorks, clearFavorites } = useContext(FavoriteWorksContext);
  const works = useWorks(
    search,
    useCallback((error) => console.error(error), []),
  );

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
              works={search?.request === '#favorites' ? favoriteWorks ?? [] : works}
              selectWork={selectWork}
              scrollContainerRef={scrollContainerRef}
              animateScroll={animateScroll}
            />
          </div>
        </div>
      </div>

      {search?.request === '#favorites' && (
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
export default WorksList;
