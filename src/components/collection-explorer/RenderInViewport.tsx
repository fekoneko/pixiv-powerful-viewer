import { DetailedHTMLProps, FC, HTMLAttributes, ReactNode, useEffect, useRef } from 'react';
import handleViewport, { InjectedViewportProps } from 'react-in-viewport';

interface RenderInViewportProps
  extends DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
  forceRender?: boolean;
  fallbackHeight?: number | string;
  children: ReactNode;
}

export const RenderInViewport: FC<RenderInViewportProps> = handleViewport<
  HTMLElement,
  InjectedViewportProps<HTMLDivElement> & RenderInViewportProps
>(
  ({
    inViewport,
    enterCount: _enterCount,
    leaveCount: _leaveCount,
    forwardedRef,
    forceRender,
    fallbackHeight,
    children,
    ...divProps
  }) => {
    const elementHeightRef = useRef<number | null>(null);

    useEffect(() => {
      if (inViewport) elementHeightRef.current = forwardedRef.current?.offsetHeight ?? null;
    }, [inViewport, forwardedRef]);

    return (
      <div {...divProps} ref={forwardedRef}>
        {inViewport || forceRender ? (
          children
        ) : (
          <div style={{ height: elementHeightRef.current ?? fallbackHeight }} />
        )}
      </div>
    );
  },
  { rootMargin: '500px' },
);
