import useWorks from '../../../hooks/useWorks';
import { memo, useCallback, useContext, useEffect, useRef, useState } from 'react';
import WorkCard from './WorkCard';
import { Work } from '@renderer/lib/Collection';
import SearchContext from '@renderer/contexts/SearchContext';
import useKeyboardEvent from '@renderer/hooks/useKeyboardEvent';
import useTimeout from '@renderer/hooks/useTimeout';

interface WorkListCardsProps {
  selectWork: (selectedWork: Work | undefined) => any;
  scrollContainerRef: React.RefObject<HTMLDivElement>;
}
const WorkListCards = memo(({ selectWork, scrollContainerRef }: WorkListCardsProps) => {
  const { search } = useContext(SearchContext);
  const works = useWorks(
    search,
    useCallback((error) => console.error(error), []),
  );
  const [selectedIndex, setSelectedIndex] = useState<number>();
  const [smoothScroll, setSmoothScroll] = useState(true);
  const [, updateSmoothScrollTimeout] = useTimeout();

  useEffect(() => {
    selectWork(selectedIndex !== undefined ? works[selectedIndex] : undefined);
  }, [selectedIndex, selectWork]);

  useEffect(() => {
    setSelectedIndex(undefined);
    scrollContainerRef.current?.scrollTo({ top: 0 });
  }, [works, setSelectedIndex]);

  useKeyboardEvent(
    'keydown',
    ['ArrowUp', 'KeyW'],
    (e) => {
      if (document.activeElement?.tagName === 'INPUT') return;
      e.preventDefault();

      setSelectedIndex((prev) => {
        if (prev === undefined) return 0;
        return prev <= 0 ? 0 : prev - 1;
      });

      updateSmoothScrollTimeout(() => setSmoothScroll(true), 100);
    },
    [setSelectedIndex],
    { control: false },
  );

  useKeyboardEvent(
    'keydown',
    ['ArrowDown', 'KeyS'],
    (e) => {
      if (document.activeElement?.tagName === 'INPUT') return;
      e.preventDefault();

      setSelectedIndex((prev) => {
        if (prev === undefined) return 0;
        return prev + 1 >= works.length - 1 ? works.length - 1 : prev + 1;
      });

      updateSmoothScrollTimeout(() => setSmoothScroll(true), 100);
    },
    [works.length, setSelectedIndex],
    { control: false },
  );

  useKeyboardEvent(
    'keyup',
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
      {works.map((work, index) => (
        <WorkCard
          key={work.path}
          work={work}
          index={index}
          selectIndex={setSelectedIndex}
          scrollContainerRef={scrollContainerRef}
          smoothScroll={smoothScroll}
          setSmoothScroll={setSmoothScroll}
          active={index === selectedIndex}
        />
      ))}
    </>
  );
});

interface WorksListProps {
  selectWork: (selectedWork: Work | undefined) => any;
}
const WorksList = ({ selectWork }: WorksListProps) => {
  const [scrolledToTheTop, setScrolledToTheTop] = useState(true);
  const [scrolledToTheBottom, setScrolledToTheBottom] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  return (
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
          <WorkListCards selectWork={selectWork} scrollContainerRef={scrollContainerRef} />
        </div>
      </div>
    </div>
  );
};
export default WorksList;
