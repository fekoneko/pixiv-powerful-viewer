import { forwardRef, SVGProps, useEffect, useId } from 'react';

export interface AssetImageViewProps extends SVGProps<SVGSVGElement> {
  src: string;
  width: number;
  height: number;
}

export const ImageView = forwardRef<SVGSVGElement, AssetImageViewProps>(
  ({ src, width, height, ...svgProps }, ref) => {
    const imageViewId = useId();

    useEffect(() => {
      const imageElement = document.createElementNS('http://www.w3.org/2000/svg', 'image');
      imageElement.setAttribute('id', imageViewId);
      imageElement.setAttribute('width', width.toString());
      imageElement.setAttribute('height', height.toString());
      imageElement.setAttribute('href', src);
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
    }, [imageViewId, src, width, height]);

    return (
      <svg ref={ref} {...svgProps} viewBox={`0 0 ${width} ${height}`}>
        <use href={'#' + imageViewId} />
      </svg>
    );
  },
);
