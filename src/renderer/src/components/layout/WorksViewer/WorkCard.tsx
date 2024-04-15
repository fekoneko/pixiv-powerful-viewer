import { Fragment } from 'react/jsx-runtime';
import { Work } from '../../../lib/Collection';
import { memo, useEffect, useRef } from 'react';
import { AnimateScroll } from '@renderer/hooks/useAnimateScroll';

interface WorkCardContents {
  work: Work;
}
const WorkCardContents = memo(({ work }: WorkCardContents) => {
  return (
    <>
      {work.assets?.length ? (
        <div className="relative size-full">
          <div className="relative flex size-full items-center transition-all [clip-path:rect(0_100%_100%_0_round_0.5rem)] hover:z-20 hover:[clip-path:rect(-100%_300%_300%_-100%_round_0.5rem)]">
            <img
              src={work.assets[0]?.mediaPath}
              className="absolute w-full rounded-lg transition-transform [transform:translate3d(0,0,0)] [:hover>&]:shadow-md [:hover>&]:[transform:scale(1.2)]"
            />
          </div>
          <p className="absolute right-0 top-0 -mr-2 -mt-0.5 rounded-lg border border-text/50 bg-background px-2 text-text shadow-md transition-colors [:hover>&]:invisible">
            x{work.assets.length}
          </p>
        </div>
      ) : (
        <div />
      )}
      <div className="overflow-hidden p-2 text-left">
        <h2 className="whitespace-nowrap text-lg font-bold text-text-accent">
          {work.title ?? 'Untitled'}
        </h2>
        <p className="mb-2 whitespace-nowrap text-sm font-semibold">
          {work.userName ?? 'Unknown author'}
        </p>
        <p className="whitespace-nowrap text-sm">
          {work.tags?.map((tag, index) => (
            <Fragment key={index}>
              {index !== 0 && <span className="opacity-50">・</span>}
              <wbr />
              <span>{tag}</span>
            </Fragment>
          )) ?? <span>no tags</span>}
        </p>
      </div>
    </>
  );
});

export interface WorkCardProps {
  work: Work;
  index: number;
  selectIndex: (index: number) => any;
  scrollContainerRef: React.RefObject<HTMLDivElement>;
  animateScroll: AnimateScroll;
  active?: boolean;
}
const WorkCard = ({
  work,
  index,
  selectIndex,
  scrollContainerRef,
  animateScroll,
  active,
}: WorkCardProps) => {
  const cardRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!active) return;

    const cardElement = cardRef.current;
    if (!cardElement) return;

    if (document.activeElement?.tagName !== 'INPUT') {
      cardElement.focus({ preventScroll: true });
    }

    const scrollContainerElement = scrollContainerRef.current;
    if (!scrollContainerElement) return;

    const scrollPosition =
      cardElement.offsetTop +
      cardElement.offsetHeight / 2 -
      scrollContainerElement.offsetHeight / 2;
    animateScroll.start({
      from: { y: scrollContainerRef.current?.scrollTop },
      to: { y: scrollPosition },
      reset: true,
    });
  }, [active, cardRef.current, animateScroll]);

  return (
    <button
      ref={cardRef}
      onClick={() => selectIndex(index)}
      tabIndex={-1}
      className={
        'grid w-full grid-cols-[3fr_8fr] items-center gap-2 rounded-xl border-2 border-text/30 p-1 shadow-md focus:outline-none' +
        (active ? ' border-text/60 bg-text/20' : ' hover:bg-text/10')
      }
    >
      <WorkCardContents work={work} />
    </button>
  );
};
export default memo(WorkCard);
