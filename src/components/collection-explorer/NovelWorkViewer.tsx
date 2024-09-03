import { FC, useCallback, useRef } from 'react';
import { useAnimateScroll, useKeyboardEvent } from '@/hooks';
import { checkTextfieldFocused } from '@/utils/is-textfield-focused';
import { Work } from '@/types/collection';

import { TextView } from './TextView';
import { EpubView } from './EpubView';

export interface NovelWorkViewerProps {
  work: Work;
}

export const NovelWorkViewer: FC<NovelWorkViewerProps> = ({ work }) => {
  const scrollContainerRef = useRef<Element>(null);
  const animateScroll = useAnimateScroll(scrollContainerRef);

  const scrollBy = useCallback(
    (offset: number) => {
      const scrollContainerElement = scrollContainerRef.current;
      if (!scrollContainerElement) return;

      const currentScrollTop = scrollContainerElement.scrollTop;
      animateScroll.start({
        from: { y: scrollContainerRef.current?.scrollTop },
        y: currentScrollTop + offset,
        reset: true,
      });
    },
    [scrollContainerRef, animateScroll],
  );

  const scrollTo = useCallback(
    (offset: number) => {
      const scrollHeight = scrollContainerRef.current?.scrollHeight;

      if (offset >= 0) animateScroll.start({ y: offset });
      else if (scrollHeight) animateScroll.start({ y: scrollHeight + offset + 1 });
    },
    [animateScroll],
  );

  useKeyboardEvent('keydown', ['PageUp', 'ArrowLeft', 'KeyA'], (e) => {
    if (checkTextfieldFocused()) return;
    e.preventDefault();
    scrollBy(e.code === 'PageUp' ? -300 : -150);
  });

  useKeyboardEvent('keydown', ['PageDown', 'ArrowRight', 'KeyD'], (e) => {
    if (checkTextfieldFocused()) return;
    e.preventDefault();
    scrollBy(e.code === 'PageDown' ? 300 : 150);
  });

  useKeyboardEvent('keydown', 'Home', (e) => {
    if (checkTextfieldFocused()) return;
    e.preventDefault();
    scrollTo(0);
  });

  useKeyboardEvent('keydown', 'End', (e) => {
    if (checkTextfieldFocused()) return;
    e.preventDefault();
    scrollTo(-1);
  });

  return (
    <div className="mx-1 size-full">
      {work.novelAsset?.path.endsWith('.txt') && (
        <TextView ref={scrollContainerRef} asset={work.novelAsset} className="z-30 size-full" />
      )}
      {work.novelAsset?.path.endsWith('.epub') && (
        <EpubView ref={scrollContainerRef} asset={work.novelAsset} className="z-30 size-full" />
      )}
    </div>
  );
};
