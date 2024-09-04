import { FC, useCallback, useEffect, useRef } from 'react';
import { useAnimateScroll, useKeyboardEvent } from '@/hooks';
import { checkTextfieldFocused } from '@/utils/check-textfield-focused';
import { Work } from '@/types/collection';

import { TextView } from '../../common/TextView';
import { EpubView } from '../../common/EpubView';
import { ImageView } from '@/components/common/ImageView';

const removeMetadataFromEpub = (document: Document) => {
  const sectionChildren = document.querySelector('section')?.childNodes;
  if (!sectionChildren) return;

  const metadataEndIndex = [...sectionChildren].findIndex(
    (node: any) =>
      node.tagName === 'BR' &&
      node.previousSibling?.tagName === 'BR' &&
      node.previousSibling?.previousSibling?.tagName === 'BR',
  );
  if (metadataEndIndex === -1) return;

  [...Array(metadataEndIndex - 1).keys()].forEach((index) => {
    sectionChildren[index + 2]?.replaceWith(document.createElement('span'));
  });
};

export interface NovelWorkViewerProps {
  work: Work;
}

export const NovelWorkViewer: FC<NovelWorkViewerProps> = ({ work }) => {
  const coverImageRef = useRef<SVGSVGElement>(null);
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

  const SyncronizeCoverScroll = useCallback(() => {
    const coverImage = coverImageRef.current;
    const scrollContainer = scrollContainerRef.current;
    if (!coverImage || !scrollContainer) return;

    coverImage.style.top = `${-scrollContainer.scrollTop * 1.15 + 8}px`;
    coverImage.style.opacity = `${1 - scrollContainer.scrollTop / 260}`;
  }, []);

  useEffect(() => {
    if (!scrollContainerRef.current) return;
    (scrollContainerRef.current as HTMLElement).onscroll = SyncronizeCoverScroll;
  });

  const handleEpubRender = useCallback(
    (document: Document) => {
      removeMetadataFromEpub(document);
      if (!scrollContainerRef.current) return;
      (scrollContainerRef.current as HTMLElement).onscroll = SyncronizeCoverScroll;
    },
    [SyncronizeCoverScroll],
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

  const coverAsset = work.imageAssets[0] ?? null;

  return (
    <div className="relative mx-1 flex size-full flex-col items-center">
      {coverAsset && (
        <ImageView
          ref={coverImageRef}
          src={coverAsset.path}
          width={coverAsset.dimensions.width}
          height={coverAsset.dimensions.height}
          className="pointer-events-none absolute z-10 max-h-80 min-h-80 rounded-md"
        />
      )}

      {work.novelAsset?.path.endsWith('.txt') && (
        <TextView
          ref={scrollContainerRef}
          src={work.novelAsset.path}
          className="size-full !pt-[23rem]"
        />
      )}

      {work.novelAsset?.path.endsWith('.epub') && (
        <EpubView
          ref={scrollContainerRef}
          src={work.novelAsset.path}
          onRender={handleEpubRender}
          className="size-full *:pt-[22rem]"
        />
      )}
    </div>
  );
};
