import { forwardRef, HTMLAttributes, useEffect, useRef, useState } from 'react';
import epub, { Rendition } from 'epubjs';
import { useTheme } from '@/hooks/use-theme';
import { convertFileSrc } from '@tauri-apps/api/core';
import { themeColors } from '@/styles/theme-colors';
import { twMerge } from 'tailwind-merge';
import { Theme } from '@/types/theme';

const getRenditionTheme = (theme: Theme) => ({
  body: {
    display: 'flex !important',
    'flex-direction': 'column !important',
    'align-items': 'center !important',
    width: '100% !important',
    padding: '0 !important',
    margin: '0 !important',
    'background-color': `${themeColors[theme].paper} !important`,
    'word-wrap': 'break-word !important',
  },
  'body > *': {
    width: 'min(85%, 40rem) !important',
  },
  'body > :last-child': {
    'padding-bottom': '4rem !important',
  },
  '*': {
    color: `${themeColors[theme].text} !important`,
  },
  'h1, h2, h3, h4, h5, h6': {
    margin: '2rem 0 !important',
  },
});

export interface EpubViewProps extends HTMLAttributes<HTMLDivElement> {
  src: string;
  onRender?: (document: Document) => void;
}

export const EpubView = forwardRef<Element, EpubViewProps>(
  ({ src, onRender, ...divProps }, ref) => {
    const { theme } = useTheme();
    const [rendition, setRendition] = useState<Rendition | null>(null);
    const viewWrapperRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      const viewWrapper = viewWrapperRef.current;
      if (!viewWrapper) return;

      const abortController = new AbortController();
      const book = epub(convertFileSrc(src));
      const rendition = book.renderTo(viewWrapper, { manager: 'continuous', flow: 'scrolled' });
      setRendition(rendition);

      return () => {
        abortController.abort();
        book.destroy();
      };
    }, [src]);

    useEffect(() => {
      rendition?.themes.default(getRenditionTheme(theme));
    }, [rendition, theme]);

    useEffect(() => {
      if (!rendition) return;
      const abortController = new AbortController();

      rendition.display(0).then(() => {
        if (!ref || abortController.signal.aborted) return;

        const scrollContainer =
          viewWrapperRef.current?.getElementsByClassName('epub-container')[0] ?? null;
        if (typeof ref === 'function') ref(scrollContainer);
        else ref.current = scrollContainer;
      });

      rendition.on('rendered', () => {
        if (abortController.signal.aborted) return;

        const viewWrapper = viewWrapperRef.current;
        const iframeDocument = viewWrapper?.getElementsByTagName('iframe')[0]?.contentDocument;
        if (!iframeDocument) return;

        onRender?.(iframeDocument);
      });

      return () => abortController.abort();
    }, [rendition, ref, onRender]);

    return (
      <div
        {...divProps}
        ref={viewWrapperRef}
        className={twMerge(
          divProps.className,
          '[&_.epub-container]:!size-full [&_.epub-view]:!w-full [&_iframe]:pointer-events-none [&_iframe]:!w-full',
        )}
      />
    );
  },
);
