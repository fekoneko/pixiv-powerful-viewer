import imageSize from 'image-size';

export const getImageDimensions = (imagePath: string): Promise<{ width: number; height: number }> =>
  new Promise((resolve, reject) =>
    imageSize(imagePath, (_, dimensions) => {
      if (!dimensions || dimensions.width === undefined || dimensions.height === undefined) {
        return reject();
      }
      resolve({ width: dimensions.width, height: dimensions.height });
    }),
  );
