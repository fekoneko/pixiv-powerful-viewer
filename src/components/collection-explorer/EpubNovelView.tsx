import { FC, HTMLAttributes, useCallback, useEffect, useRef, useState } from 'react';
import { useTheme } from '@/hooks/use-theme';
import epub, { Rendition } from 'epubjs';
import { convertFileSrc } from '@tauri-apps/api/tauri';
import { themeColors } from '@/styles/theme-colors';
import { twMerge } from 'tailwind-merge';
import { NovelAsset } from '@/types/collection';
import { Theme } from '@/types/theme';
import { useAnimateScroll, useKeyboardEvent } from '@/hooks';
import { checkTextfieldFocused } from '@/utils/is-textfield-focused';

const getRenditionTheme = (theme: Theme) => ({
  body: {
    width: '100% !important',
    padding: '0.5rem 10% !important',
    margin: '0 !important',
    'background-color': `${themeColors[theme].paper} !important`,
    'word-wrap': 'break-word !important',
  },
  '*': {
    color: `${themeColors[theme].text} !important`,
  },
  'h1, h2, h3, h4, h5, h6': {
    margin: '2rem 0 !important',
  },
});

export interface EpubNovelDocumentProps extends HTMLAttributes<HTMLDivElement> {
  asset: NovelAsset;
}

export const EpubNovelDocument: FC<EpubNovelDocumentProps> = ({ asset, ...divProps }) => {
  const { theme } = useTheme();
  const [rendition, setRendition] = useState<Rendition | null>(null);
  const viewWrapperRef = useRef<HTMLDivElement | null>(null);
  const scrollContainerRef = useRef<Element | null>(null);
  const animateScroll = useAnimateScroll(scrollContainerRef);

  useEffect(() => {
    const viewWrapper = viewWrapperRef.current;
    if (!viewWrapper) return;

    const abortController = new AbortController();
    const book = epub(convertFileSrc(asset.path));
    const rendition = book.renderTo(viewWrapper, { manager: 'continuous', flow: 'scrolled' });
    setRendition(rendition);

    return () => {
      abortController.abort();
      book.destroy();
    };
  }, [asset]);

  useEffect(() => {
    rendition?.themes.default(getRenditionTheme(theme));
  }, [rendition, theme]);

  useEffect(() => {
    rendition?.display(0).then(() => {
      scrollContainerRef.current =
        viewWrapperRef.current?.getElementsByClassName('epub-container')[0] ?? null;
    });
  }, [rendition]);

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

  useKeyboardEvent(
    'keydown',
    ['PageUp', 'ArrowLeft', 'KeyA'],
    (e) => {
      if (checkTextfieldFocused() || !rendition) return;
      e.preventDefault();
      scrollBy(e.code === 'PageUp' ? -300 : -150);
    },
    [rendition],
  );

  useKeyboardEvent(
    'keydown',
    ['PageDown', 'ArrowRight', 'KeyD'],
    (e) => {
      if (checkTextfieldFocused() || !rendition) return;
      e.preventDefault();
      scrollBy(e.code === 'PageDown' ? 300 : 150);
    },
    [rendition],
  );

  useKeyboardEvent(
    'keydown',
    ['Home'],
    (e) => {
      if (checkTextfieldFocused() || !rendition) return;
      e.preventDefault();
      scrollTo(0);
    },
    [scrollTo],
  );

  useKeyboardEvent(
    'keydown',
    ['End'],
    (e) => {
      if (checkTextfieldFocused() || !rendition) return;
      e.preventDefault();
      scrollTo(-1);
    },
    [scrollTo],
  );

  return (
    <div
      {...divProps}
      ref={viewWrapperRef}
      className={twMerge(
        divProps.className,
        '[&_.epub-container]:!size-full [&_.epub-view]:!w-full [&_iframe]:!w-full',
      )}
    />
  );
};
