import { useEffect, useRef } from 'react';
import handleViewport, { InjectedViewportProps } from 'react-in-viewport';

interface RenderInViewportProps {
  forceRender?: boolean;
  fallbackHeight?: number | string;
  children: React.ReactElement;
}
const RenderInViewport = handleViewport(
  ({
    inViewport,
    enterCount: _enterCount,
    leaveCount: _leaveCount,
    forwardedRef,
    forceRender,
    fallbackHeight,
    children,
    ...divAttributes
  }: InjectedViewportProps<HTMLDivElement> &
    RenderInViewportProps &
    React.HTMLAttributes<HTMLDivElement>) => {
    const elementHeightRef = useRef<number | undefined>(undefined);
    useEffect(() => {
      if (inViewport) elementHeightRef.current = forwardedRef.current?.offsetHeight;
    }, [inViewport]);

    return (
      <div {...divAttributes} ref={forwardedRef}>
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
export default RenderInViewport;
