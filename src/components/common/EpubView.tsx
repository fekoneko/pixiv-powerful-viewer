import { forwardRef, HTMLAttributes, useEffect, useRef, useState } from 'react';
import epub, { Rendition } from 'epubjs';
import { useTheme } from '@/hooks/use-theme';
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
  fontSrc?: string;
  onRender?: (document: Document) => void;
}

export const EpubView = forwardRef<Element, EpubViewProps>(
  ({ src, fontSrc, onRender, ...divProps }, ref) => {
    const { theme } = useTheme();
    const [rendition, setRendition] = useState<Rendition | null>(null);
    const [isRendered, setIsRendered] = useState(false);
    const viewWrapperRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      const viewWrapper = viewWrapperRef.current;
      if (!viewWrapper) return;

      const book = epub(src);
      const rendition = book.renderTo(viewWrapper, { manager: 'continuous', flow: 'scrolled' });
      setRendition(rendition);

      return () => book.destroy();
    }, [src]);

    useEffect(() => {
      if (!rendition) return;
      const abortController = new AbortController();

      rendition.display(0).then(() => {
        if (abortController.signal.aborted) return;
        setIsRendered(true);
      });

      return () => abortController.abort();
    }, [rendition]);

    useEffect(() => {
      rendition?.themes.default(getRenditionTheme(theme));
    }, [rendition, theme]);

    useEffect(() => {
      if (!ref || !isRendered) return;

      const scrollContainer =
        viewWrapperRef.current?.getElementsByClassName('epub-container')[0] ?? null;
      if (typeof ref === 'function') ref(scrollContainer);
      else ref.current = scrollContainer;
    }, [isRendered, ref]);

    useEffect(() => {
      if (!isRendered) return;

      const viewWrapper = viewWrapperRef.current;
      const iframeDocument = viewWrapper?.getElementsByTagName('iframe')[0]?.contentDocument;
      if (!iframeDocument) return;

      onRender?.(iframeDocument);
    }, [isRendered, onRender]);

    useEffect(() => {
      if (!fontSrc || !isRendered) return;

      const viewWrapper = viewWrapperRef.current;
      const iframeDocument = viewWrapper?.getElementsByTagName('iframe')[0]?.contentDocument;
      if (!iframeDocument) return;

      const styleElement = iframeDocument.createElement('style');
      styleElement.textContent = `
        @font-face {
          font-family: 'epub-view-font';
          src: url(${fontSrc});
        }`;
      iframeDocument.head.appendChild(styleElement);
      iframeDocument.body.style.setProperty('font-family', 'epub-view-font');

      return () => styleElement.remove();
    }, [isRendered, fontSrc]);

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
