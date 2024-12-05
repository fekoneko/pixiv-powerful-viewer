import { renderGifImage } from '@/lib/image-view/render-gif-image';
import { renderStaticImage } from '@/lib/image-view/render-static-image';
import { FC, memo, useEffect, useRef } from 'react';
import { twMerge } from 'tailwind-merge';

export type ImageViewFormat = 'static' | 'gif';

export interface ImageViewProps {
  src: string;
  resolution?: number;
  maxResolution?: number;
  format?: ImageViewFormat;
  className?: string;
}

export const ImageView: FC<ImageViewProps> = memo(
  ({ src, resolution, maxResolution, format = 'static', className }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const abortController = new AbortController();
      const { signal } = abortController;

      if (format === 'static') {
        renderStaticImage({ canvas, src, resolution, maxResolution, signal });
      } else if (format === 'gif') {
        renderGifImage({ canvas, src, resolution, maxResolution, signal });
      }

      return () => abortController.abort();
    }, [format, src, resolution, maxResolution]);

    return <canvas ref={canvasRef} className={twMerge(className, 'object-contain')} />;
  },
);
