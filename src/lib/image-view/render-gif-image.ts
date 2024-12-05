import { decompressFrames, parseGIF } from 'gifuct-js';

export interface RenderGifImageOptions {
  canvas: HTMLCanvasElement;
  src: string | URL | globalThis.Request;
  resolution?: number;
  maxResolution?: number;
  signal?: AbortSignal;
}

export const renderGifImage = async ({
  canvas,
  src,
  resolution,
  maxResolution = Infinity,
  signal,
}: RenderGifImageOptions) => {
  const response = await fetch(src);
  const arrayBuffer = await response.arrayBuffer();

  const context = canvas.getContext('2d');
  if (!context || signal?.aborted) return;

  const gif = parseGIF(arrayBuffer);
  const frames = decompressFrames(gif, true);
  if (frames[0] == undefined) return;

  const width = Math.min(resolution ?? gif.lsd.width, maxResolution);
  const height = width * (gif.lsd.height / gif.lsd.width);
  canvas.width = width;
  canvas.height = height;

  let currentFrameIndex = 0;

  const drawNextFrame = () => {
    if (signal?.aborted) return;

    const imageData = new ImageData(frames[currentFrameIndex]!.patch, width, height);
    context.putImageData(imageData, 0, 0);

    currentFrameIndex = (currentFrameIndex + 1) % frames.length;
    setTimeout(drawNextFrame, frames[currentFrameIndex]!.delay);
  };

  drawNextFrame();
};
