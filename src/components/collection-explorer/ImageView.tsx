import { FC, SVGProps, useEffect } from 'react';
import { convertFileSrc } from '@tauri-apps/api/tauri';
import { ImageAsset } from '@/types/collection';

export interface AssetImageViewProps extends SVGProps<SVGSVGElement> {
  asset: ImageAsset;
}

export const ImageView: FC<AssetImageViewProps> = ({ asset, ...svgProps }) => {
  useEffect(() => {
    const imageElement = document.createElementNS('http://www.w3.org/2000/svg', 'image');
    imageElement.setAttribute('id', asset.path);
    imageElement.setAttribute('width', asset.dimensions.width.toString());
    imageElement.setAttribute('height', asset.dimensions.height.toString());
    imageElement.setAttribute('href', convertFileSrc(asset.path));
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
