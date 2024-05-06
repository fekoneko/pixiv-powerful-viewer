import { ImageAsset } from '@renderer/lib/Collection';
import { HTMLAttributes, useEffect, useRef, useState } from 'react';

export interface AssetImageViewProps {
  asset: ImageAsset;
  predecodedImageId: number;
}
const AssetImageView = ({
  asset,
  predecodedImageId,
  ...divAttributes
}: AssetImageViewProps & HTMLAttributes<HTMLDivElement>) => {
  const imageContainerRef = useRef<HTMLDivElement>(null);
  const [decodingError, setDecodingError] = useState(false);

  useEffect(() => {
    asset.image
      .decode(predecodedImageId)
      .then((image) => {
        imageContainerRef.current?.replaceChildren(image);
        console.log('rendered', asset.name);
      })
      .catch((error) => {
        imageContainerRef.current?.replaceChildren();
        console.log('error rendering', asset.name, error);
        setDecodingError(true);
      });
  }, [asset, predecodedImageId]);

  return (
    <div ref={imageContainerRef} {...divAttributes}>
      {decodingError && <img src={asset.image.src} alt={asset.name} decoding="async" />}
    </div>
  );
};
export default AssetImageView;
