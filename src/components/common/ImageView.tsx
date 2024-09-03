import { FC, SVGProps, useEffect } from 'react';
import { convertFileSrc } from '@tauri-apps/api/tauri';

export interface AssetImageViewProps extends SVGProps<SVGSVGElement> {
  src: string;
  width: number;
  height: number;
}

export const ImageView: FC<AssetImageViewProps> = ({ src, width, height, ...svgProps }) => {
  useEffect(() => {
    const imageElement = document.createElementNS('http://www.w3.org/2000/svg', 'image');
    imageElement.setAttribute('id', src);
    imageElement.setAttribute('width', width.toString());
    imageElement.setAttribute('height', height.toString());
    imageElement.setAttribute('href', convertFileSrc(src));
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
  }, [src, width, height]);

  return (
    <svg {...svgProps} viewBox={`0 0 ${width} ${height}`}>
      <use href={'#' + src} />
    </svg>
  );
};
