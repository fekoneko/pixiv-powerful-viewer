import { ImageAsset } from '@/lib/collection';
import { FC, SVGProps, useEffect } from 'react';

export interface AssetImageViewProps extends SVGProps<SVGSVGElement> {
  asset: ImageAsset;
}

export const AssetImageView: FC<AssetImageViewProps> = ({ asset, ...svgProps }) => {
  useEffect(() => {
    const imageElement = document.createElementNS('http://www.w3.org/2000/svg', 'image');
    imageElement.setAttribute('id', asset.path);
    imageElement.setAttribute('width', asset.dimensions.width.toString());
    imageElement.setAttribute('height', asset.dimensions.height.toString());
    imageElement.setAttribute('href', asset.path); // TODO: fix media path
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
    <svg {...svgProps} viewBox={`0 0 ${asset.dimensions.width} ${asset.dimensions.height}`}>
      <use href={'#' + asset.path} />
    </svg>
  );
};
