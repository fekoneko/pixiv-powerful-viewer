import { ForwardedRef, forwardRef, HTMLAttributes, useEffect, useState } from 'react';
import { convertFileSrc } from '@tauri-apps/api/tauri';
import { twMerge } from 'tailwind-merge';

export interface TextViewProps extends HTMLAttributes<HTMLPreElement> {
  src: string;
}

export const TextView = forwardRef<Element, TextViewProps>(({ src, ...preProps }, ref) => {
  const [text, setText] = useState<string | null>(null);

  useEffect(() => {
    const abortController = new AbortController();

    fetch(convertFileSrc(src), { signal: abortController.signal })
      .then((response) => response.text())
      .then((text) => setText(text))
      .catch(() => {
        if (abortController.signal.aborted) return;
        setText(null);
      });

    return () => abortController.abort();
  }, [src]);

  return (
    <pre
      ref={ref as ForwardedRef<HTMLPreElement>}
      {...preProps}
      className={twMerge(preProps.className, 'overflow-y-scroll px-[10%] py-8 font-[inherit]')}
    >
      {text}
    </pre>
  );
});
