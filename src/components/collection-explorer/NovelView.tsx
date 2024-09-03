import { FC, HTMLAttributes, useCallback, useRef } from 'react';
import { twMerge } from 'tailwind-merge';
import { NovelAsset } from '@/types/collection';

import { TextNovelDocument } from './TextNovelDocument';
import { EpubNovelDocument } from './EpubNovelView';
import { useAnimateScroll, useKeyboardEvent } from '@/hooks';
import { checkTextfieldFocused } from '@/utils/is-textfield-focused';

export interface NovelViewProps extends HTMLAttributes<HTMLDivElement> {
  asset: NovelAsset;
}

export const NovelView: FC<NovelViewProps> = ({ asset, ...divProps }) => {
  const scrollContainerRef = useRef<Element | null>(null);
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
    <div {...divProps} className={twMerge(divProps.className, 'mx-1')}>
      {asset?.path.endsWith('.txt') && (
        <TextNovelDocument ref={scrollContainerRef} asset={asset} className="z-30 size-full" />
      )}
      {asset?.path.endsWith('.epub') && (
        <EpubNovelDocument ref={scrollContainerRef} asset={asset} className="z-30 size-full" />
      )}
    </div>
  );
};
