import { ForwardedRef, forwardRef, HTMLAttributes, useEffect, useState } from 'react';
import { twMerge } from 'tailwind-merge';

export interface TextViewProps extends HTMLAttributes<HTMLPreElement> {
  src: string;
  fontSrc?: string;
}

export const TextView = forwardRef<Element, TextViewProps>(({ src, fontSrc, ...preProps }, ref) => {
  const [text, setText] = useState<string | null>(null);

  useEffect(() => {
    const abortController = new AbortController();

    fetch(src, { signal: abortController.signal })
      .then((response) => response.text())
      .then((text) => setText(text))
      .catch(() => {
        if (abortController.signal.aborted) return;
        setText(null);
      });

    return () => abortController.abort();
  }, [src]);

  return (
    <>
      {fontSrc && (
        <style>
          {`@font-face {
            font-family: 'text-view-font';
            src: url(${fontSrc});
          }`}
        </style>
      )}

      <pre
        ref={ref as ForwardedRef<HTMLPreElement>}
        {...preProps}
        className={twMerge(
          preProps.className,
          'overflow-y-scroll px-[10%] py-8',
          fontSrc && 'font-[text-view-font]',
        )}
      >
        {text}
      </pre>
    </>
  );
});
