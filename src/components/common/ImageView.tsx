import { decompressFrames, parseGIF } from 'gifuct-js';
import { FC, useCallback, useEffect, useRef } from 'react';
import { twMerge } from 'tailwind-merge';

const RENDER_STEP = 200;

export interface ImageViewProps {
  src: string;
  resolution?: number;
  maxResolution?: number;
  animateAsGif?: boolean;
  className?: string;
}

export const ImageView: FC<ImageViewProps> = ({
  src,
  resolution,
  maxResolution = Infinity,
  animateAsGif = false,
  className,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleStaticImage = useCallback(
    async (canvasElement: HTMLCanvasElement, signal: AbortSignal) => {
      const image = new Image();
      image.src = src;
      await new Promise((resolve) => (image.onload = resolve));

      const context = canvasElement.getContext('2d');
      if (!context || signal.aborted) return;

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
        if (dy >= height || signal.aborted) {
          clearInterval(interval);
          return;
        }

        const sy = dy * (image.naturalHeight / height);
        context.drawImage(image, 0, sy, sw, sh, 0, dy, dw, dh);
        dy += RENDER_STEP;
      }, 0);
    },
    [src, resolution, maxResolution],
  );

  const handleGifImage = useCallback(
    async (canvasElement: HTMLCanvasElement, signal: AbortSignal) => {
      const response = await fetch(src);
      const arrayBuffer = await response.arrayBuffer();

      const context = canvasElement.getContext('2d');
      if (!context || signal.aborted) return;

      const gif = parseGIF(arrayBuffer);
      const frames = decompressFrames(gif, true);
      if (frames[0] == undefined) return;

      const width = Math.min(resolution ?? gif.lsd.width, maxResolution);
      const height = width * (gif.lsd.height / gif.lsd.width);
      canvasElement.width = width;
      canvasElement.height = height;

      let currentFrameIndex = 0;

      const drawNextFrame = () => {
        if (signal.aborted) return;

        const imageData = new ImageData(frames[currentFrameIndex]!.patch, width, height);
        context.putImageData(imageData, 0, 0);

        currentFrameIndex = (currentFrameIndex + 1) % frames.length;
        setTimeout(drawNextFrame, frames[currentFrameIndex]!.delay);
      };

      drawNextFrame();
    },
    [src, resolution, maxResolution],
  );

  useEffect(() => {
    const canvasElement = canvasRef.current;
    if (!canvasElement) return;

    const abortController = new AbortController();
    if (animateAsGif) handleGifImage(canvasElement, abortController.signal);
    else handleStaticImage(canvasElement, abortController.signal);

    return () => abortController.abort();
  }, [animateAsGif, handleStaticImage, handleGifImage]);

  return <canvas ref={canvasRef} className={twMerge(className, 'object-contain')} />;
};
