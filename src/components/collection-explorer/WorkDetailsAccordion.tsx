import { FC, useCallback, useMemo, useRef, useState } from 'react';
import { useAnimateScroll, useCollection, useKeyboardEvent } from '@/hooks';
import { checkTextfieldFocused } from '@/utils/is-textfield-focused';
import { twMerge } from 'tailwind-merge';
import { Work } from '@/types/collection';

import { WorkDetails } from './WorkDetails';

interface WorkDetailsAccordionProps {
  work: Work | null;
  onToggleFullscreen: () => void;
}

export const WorkDetailsAccordion: FC<WorkDetailsAccordionProps> = ({
  work,
  onToggleFullscreen,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { toggleFavorite, checkFavorited } = useCollection();
  const isFavorited = useMemo(() => work && checkFavorited(work), [work, checkFavorited]);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const animateScroll = useAnimateScroll(scrollContainerRef);

  const toggleExpanded = useCallback(() => setIsExpanded((prev) => !prev), []);

  const scrollUp = useCallback(() => {
    const scrollContainerElement = scrollContainerRef.current;
    if (!scrollContainerElement) return;

    const currentScrollTop = scrollContainerElement.scrollTop;
    animateScroll.start({
      from: { y: scrollContainerRef.current?.scrollTop },
      y: currentScrollTop - 150,
      reset: true,
    });
  }, [scrollContainerRef, animateScroll]);

  const scrollDown = useCallback(() => {
    const scrollContainerElement = scrollContainerRef.current;
    if (!scrollContainerElement) return;

    const currentScrollTop = scrollContainerElement.scrollTop;
    animateScroll.start({
      from: { y: scrollContainerRef.current?.scrollTop },
      y: currentScrollTop + 150,
      reset: true,
    });
  }, [scrollContainerRef, animateScroll]);

  useKeyboardEvent(
    'keydown',
    'Space',
    (e) => {
      if (checkTextfieldFocused() || !work) return;
      e.preventDefault();
      toggleExpanded();
    },
    [toggleExpanded],
  );

  useKeyboardEvent(
    'keydown',
    'Enter',
    (e) => {
      if (checkTextfieldFocused() || !work) return;
      e.preventDefault();
      toggleFavorite(work);
    },
    [toggleFavorite],
    { shift: true, control: false },
  );

  useKeyboardEvent(
    'keydown',
    ['ArrowUp', 'KeyW'],
    (e) => {
      if (checkTextfieldFocused() || !work) return;
      e.preventDefault();
      scrollUp();
    },
    [scrollUp],
    { control: true },
  );

  useKeyboardEvent(
    'keydown',
    ['ArrowDown', 'KeyS'],
    (e) => {
      if (checkTextfieldFocused() || !work) return;
      e.preventDefault();
      scrollDown();
    },
    [scrollDown],
    { control: true },
  );

  if (!work) return null;

  return (
    <div
      className={twMerge(
        'bg-paper flex min-h-10 flex-col overflow-y-hidden rounded-lg shadow-lg transition-[height] duration-1000',
        isExpanded ? 'h-1/2' : 'h-10',
      )}
    >
      <div className={twMerge('flex h-10 gap-1 p-1', isExpanded && 'shadow- z-10')}>
        <button onClick={toggleExpanded} className="flex min-w-1 grow gap-1 focus:outline-none">
          <div className="items-center rounded-md px-2 py-1 text-sm transition-colors [:focus>&]:text-text-accent [:hover>&]:text-text-accent">
            {isExpanded ? '▼' : '▲'}
          </div>
          <h2 className="grow overflow-hidden whitespace-nowrap text-left text-lg font-semibold">
            {isExpanded ? 'Details' : work.title}
          </h2>
        </button>

        <div className="flex gap-1">
          <button
            onClick={() => toggleFavorite(work)}
            className="rounded-md px-3 hover:bg-text/20 focus:bg-text/20 focus:outline-none"
          >
            {isFavorited ? 'Favorited⭐' : 'Favorite'}
          </button>
          <div className="my-2 w-[2px] rounded-full bg-text/40" />
          <button
            onClick={onToggleFullscreen}
            className="rounded-md px-3 hover:bg-text/20 focus:bg-text/20 focus:outline-none"
          >
            Fullscreen
          </button>
        </div>
      </div>

      <div ref={scrollContainerRef} className="overflow-x-hidden overflow-y-scroll px-3 pb-5">
        <WorkDetails work={work} isExpanded={isExpanded} />
      </div>
    </div>
  );
};
