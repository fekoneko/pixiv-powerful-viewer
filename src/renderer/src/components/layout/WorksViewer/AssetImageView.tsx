import { ImageAsset } from '@renderer/lib/Collection';
import { HTMLAttributes, useEffect } from 'react';

export interface AssetImageViewProps {
  asset: ImageAsset;
}
const AssetImageView = ({
  asset,
  ...svgAttributes
}: AssetImageViewProps & HTMLAttributes<SVGSVGElement>) => {
  useEffect(() => {
    const imageElement = document.createElementNS('http://www.w3.org/2000/svg', 'image');
    imageElement.setAttribute('id', asset.imageId);
    imageElement.setAttribute('width', (asset.imageDimensions.width ?? 100).toString());
    imageElement.setAttribute('height', (asset.imageDimensions.height ?? 100).toString());
    imageElement.setAttribute('href', asset.mediaPath);
    imageElement.setAttribute('decoding', 'async');

    let originElement = document.getElementById('images-origin');
    if (!originElement) {
      originElement = document.createElement('svg');
      document.body.appendChild(originElement);
      originElement.id = 'images-origin';
      originElement.style.display = 'none';
    }
    originElement.appendChild(imageElement);

    return () => imageElement.remove();
  }, [asset]);

  return (
    <svg
      {...svgAttributes}
      viewBox={`0 0 ${asset.imageDimensions.width ?? 100} ${asset.imageDimensions.height ?? 100}`}
    >
      <use href={'#' + asset.imageId} />
    </svg>
  );
};
export default AssetImageView;
