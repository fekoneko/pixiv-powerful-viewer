export interface RenderStaticImageOptions {
  canvas: HTMLCanvasElement;
  src: string;
  resolution?: number;
  maxResolution?: number;
  renderStep?: number;
  signal?: AbortSignal;
}

export const renderStaticImage = async ({
  canvas,
  src,
  resolution,
  maxResolution = Infinity,
  renderStep = 100,
  signal,
}: RenderStaticImageOptions) => {
  const image = new Image();
  image.src = src;
  await new Promise((resolve) => (image.onload = resolve));

  const context = canvas.getContext('2d');
  if (!context || signal?.aborted) return;

  const width = Math.min(resolution ?? image.naturalWidth, maxResolution);
  const height = width * (image.naturalHeight / image.naturalWidth);
  canvas.width = width;
  canvas.height = height;

  const sw = image.naturalWidth;
  const dw = width;
  const dh = renderStep;
  const sh = dh * (image.naturalHeight / height);
  let dy = 0;

  const interval = setInterval(() => {
    if (dy >= height || signal?.aborted) {
      clearInterval(interval);
      return;
    }

    const sy = dy * (image.naturalHeight / height);
    context.drawImage(image, 0, sy, sw, sh, 0, dy, dw, dh);
    dy += renderStep;
  }, 0);
};
