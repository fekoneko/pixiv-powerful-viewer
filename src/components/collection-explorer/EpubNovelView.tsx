import { FC, HTMLAttributes, useEffect, useRef, useState } from 'react';
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

export const EpubNovelDocument: FC<EpubNovelDocumentProps> = ({ asset, ...divProps }) => {
  const { theme } = useTheme();
  const [rendition, setRendition] = useState<Rendition | null>(null);
  const viewWrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const viewWrapper = viewWrapperRef.current;
    if (!viewWrapper) return;

    const book = epub(convertFileSrc(asset.path));
    const rendition = book.renderTo(viewWrapper, { manager: 'continuous', flow: 'scrolled' });
    const displayViewPromise = rendition.display(0);

    setRendition(rendition);

    return () => {
      displayViewPromise.then(() => rendition.destroy());
    };
  }, [asset, theme]);

  useEffect(() => {
    rendition?.themes.default(getRenditionTheme(theme));
  }, [rendition, theme]);

  return (
    <div
      {...divProps}
      ref={viewWrapperRef}
      className={twMerge(
        divProps.className,
        '[&_.epub-container]:!w-full [&_.epub-container]:!overflow-y-visible [&_.epub-view]:!w-full [&_iframe]:!w-full',
      )}
    />
  );
};
