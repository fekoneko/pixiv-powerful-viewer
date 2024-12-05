import { FC, useEffect, useRef } from 'react';
import { twMerge } from 'tailwind-merge';

const RENDER_STEP = 200;

export interface ImageViewProps {
  src: string;
  resolution?: number;
  maxResolution?: number;
  className?: string;
}

export const ImageView: FC<ImageViewProps> = ({
  src,
  resolution,
  maxResolution = Infinity,
  className,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvasElement = canvasRef.current;
    if (!canvasElement) return;

    const abortController = new AbortController();
    const image = new Image();
    image.src = src;

    image.onload = () => {
      const context = canvasElement.getContext('2d');
      if (!context || abortController.signal.aborted) return;

      const width = Math.min(resolution ?? image.naturalWidth, maxResolution);
      const height = width * (image.naturalHeight / image.naturalWidth);
      canvasElement.width = width;
      canvasElement.height = height;

      const sw = image.naturalWidth;
      const dw = width;
      const dh = RENDER_STEP;
      const sh = dh * (image.naturalHeight / height);
      let dy = 0;

      const interval = setInterval(() => {
        if (dy >= height || abortController.signal.aborted) {
          clearInterval(interval);
          return;
        }

        const sy = dy * (image.naturalHeight / height);
        context.drawImage(image, 0, sy, sw, sh, 0, dy, dw, dh);
        dy += RENDER_STEP;
      }, 0);
    };

    return () => abortController.abort();
  }, [src, resolution, maxResolution]);

  return <canvas ref={canvasRef} className={twMerge(className, 'object-contain')} />;
};
