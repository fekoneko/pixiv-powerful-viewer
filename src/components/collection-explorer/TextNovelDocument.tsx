import { ForwardedRef, forwardRef, HTMLAttributes, useEffect, useState } from 'react';
import { convertFileSrc } from '@tauri-apps/api/tauri';
import { twMerge } from 'tailwind-merge';
import { NovelAsset } from '@/types/collection';

export interface TextNovelDocumentProps extends HTMLAttributes<HTMLPreElement> {
  asset: NovelAsset;
}

export const TextNovelDocument = forwardRef<Element, TextNovelDocumentProps>(
  ({ asset, ...preProps }, ref) => {
    const [text, setText] = useState<string | null>(null);

    useEffect(() => {
      const abortController = new AbortController();

      fetch(convertFileSrc(asset.path), { signal: abortController.signal })
        .then((response) => response.text())
        .then((text) => setText(text))
        .catch(() => {
          if (abortController.signal.aborted) return;
          setText(null);
        });

      return () => abortController.abort();
    }, [asset]);

    return (
      <pre
        ref={ref as ForwardedRef<HTMLPreElement>}
        {...preProps}
        className={twMerge(preProps.className, 'overflow-y-scroll px-[10%] py-8 font-[inherit]')}
      >
        {text}
      </pre>
    );
  },
);
