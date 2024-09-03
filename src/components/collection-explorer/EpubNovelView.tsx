import { forwardRef, HTMLAttributes, useEffect, useRef, useState } from 'react';
import { useTheme } from '@/hooks/use-theme';
import epub, { Rendition } from 'epubjs';
import { convertFileSrc } from '@tauri-apps/api/tauri';
import { themeColors } from '@/styles/theme-colors';
import { twMerge } from 'tailwind-merge';
import { NovelAsset } from '@/types/collection';
import { Theme } from '@/types/theme';

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

export const EpubNovelDocument = forwardRef<Element | null, EpubNovelDocumentProps>(
  ({ asset, ...divProps }, ref) => {
    const { theme } = useTheme();
    const [rendition, setRendition] = useState<Rendition | null>(null);
    const viewWrapperRef = useRef<HTMLDivElement>(null);

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
        if (!ref) return;

        const scrollContainer =
          viewWrapperRef.current?.getElementsByClassName('epub-container')[0] ?? null;
        if (typeof ref === 'function') ref(scrollContainer);
        else ref.current = scrollContainer;
      });
    }, [rendition, ref]);

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
  },
);
