import { FC, RefObject, memo, useCallback, useEffect, useRef } from 'react';
import { AnimateScroll } from '@/hooks/use-animate-scroll';
import { checkTextfieldFocused } from '@/utils/check-textfield-focused';
import { twMerge } from 'tailwind-merge';
import { Work } from '@/types/collection';
import { WorksListCardContent } from './WorksListCardContents';

export interface WorksListCardProps {
  work: Work;
  index: number;
  onSelect: (index: number) => void;
  scrollContainerRef: RefObject<HTMLDivElement>;
  animateScroll: AnimateScroll;
  active?: boolean;
}

export const WorksListCard: FC<WorksListCardProps> = memo(
  ({ work, index, onSelect, scrollContainerRef, animateScroll, active }) => {
    const cardRef = useRef<HTMLButtonElement>(null);

    const focusOnThisCard = useCallback(() => {
      const cardElement = cardRef.current;
      if (!cardElement) return;

      if (!checkTextfieldFocused()) {
        cardElement.focus({ preventScroll: true });
      }

      const scrollContainerElement = scrollContainerRef.current;
      if (!scrollContainerElement) return;

      const scrollPosition =
        cardElement.offsetTop +
        cardElement.offsetHeight / 2 -
        scrollContainerElement.offsetHeight / 2;
      animateScroll.start({ to: { y: scrollPosition } });
    }, [cardRef, scrollContainerRef, animateScroll]);

    useEffect(() => {
      if (active) focusOnThisCard();
    }, [active, focusOnThisCard]);

    return (
      <button
        ref={cardRef}
        onClick={() => onSelect(index)}
        tabIndex={-1}
        className={twMerge(
          'grid w-full grid-cols-[3fr_8fr] items-center gap-2 rounded-lg border border-border p-1 shadow-md focus:outline-none',
          active ? 'bg-paper-accent' : 'bg-paper hover:bg-paper-hover',
        )}
      >
        <WorksListCardContent work={work} />
      </button>
    );
  },
);
