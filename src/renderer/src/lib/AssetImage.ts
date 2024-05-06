export default class AssetImage {
  public src: string;
  private imagePromises: Promise<HTMLImageElement>[] | undefined;
  private predecodedImagesCount;

  constructor(src: string, predecodedImagesCount: number) {
    this.src = src;
    this.predecodedImagesCount = predecodedImagesCount;
  }

  public decode(imageId: number): Promise<HTMLImageElement> {
    let retries = 0;
    const getImagePromise = () => {
      const image = new Image();
      image.src = this.src;
      image.decoding = 'async';
      return image
        .decode()
        .then(() => image)
        .catch(() => {
          if (retries > 5) return Promise.reject();
          retries++;
          console.log('retrying to decode', this.src, retries);
          return getImagePromise();
        });
    };

    if (imageId >= this.predecodedImagesCount) {
      return getImagePromise();
    }

    if (!this.imagePromises) {
      this.imagePromises = [];
      for (let i = 0; i < this.predecodedImagesCount; i++) {
        this.imagePromises.push(getImagePromise());
      }
    }
    return this.imagePromises[imageId];
  }
}
