import { FC, RefObject, memo, useCallback, useEffect, useRef } from 'react';
import { Fragment } from 'react/jsx-runtime';
import { AnimateScroll } from '@/hooks/use-animate-scroll';
import { twMerge } from 'tailwind-merge';
import { Work } from '@/types/collection';

import { ImageView } from './ImageView';
import { checkTextfieldFocused } from '@/utils/is-textfield-focused';

interface WorkCardContents {
  work: Work;
}

const WorkCardContents: FC<WorkCardContents> = memo(({ work }: WorkCardContents) => (
  <>
    {!!work.assets?.length && (
      <div className="relative size-full">
        <div className="relative flex size-full items-center transition-all [clip-path:rect(0_100%_100%_0_round_0.5rem)] hover:z-20 hover:translate-x-1 hover:[clip-path:rect(-100%_300%_300%_-100%_round_0.5rem)]">
          <ImageView
            asset={work.assets[0]}
            className="pointer-events-none absolute w-full rounded-lg transition-transform [:hover>&]:scale-[1.2] [:hover>&]:shadow-md"
          />
        </div>
        <p className="absolute right-0 top-0 -mr-2 -mt-0.5 rounded-lg bg-paper px-2 text-text shadow-md transition-colors [:hover>&]:invisible">
          x{work.assets.length}
        </p>
      </div>
    )}
    {!work.assets?.length && <div />}

    <div className="overflow-hidden p-2 text-left">
      <h2 className="whitespace-nowrap text-lg font-bold text-text-accent">
        {work.title ?? 'Untitled'}
      </h2>
      <p className="mb-2 whitespace-nowrap text-sm font-semibold">
        {work.userName ?? 'Unknown author'}
      </p>
      <p className="whitespace-nowrap text-sm">
        {!!work.tags?.length &&
          work.tags.map((tag, index) => (
            <Fragment key={index}>
              {index !== 0 && <span className="opacity-50">・</span>}
              <wbr />
              <span>{tag}</span>
            </Fragment>
          ))}
        {!work.tags?.length && <span>No tags</span>}
      </p>
    </div>
  </>
));

export interface WorkCardProps {
  work: Work;
  index: number;
  onSelect: (index: number) => void;
  scrollContainerRef: RefObject<HTMLDivElement>;
  animateScroll: AnimateScroll;
  active?: boolean;
}

export const WorkCard: FC<WorkCardProps> = memo(
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
          'grid w-full grid-cols-[3fr_8fr] items-center gap-2 rounded-lg p-1 shadow-md focus:outline-none',
          active ? 'bg-paper-accent' : 'bg-paper hover:bg-paper-hover',
        )}
      >
        <WorkCardContents work={work} />
      </button>
    );
  },
);
