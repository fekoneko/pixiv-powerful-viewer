import { FC, HTMLAttributes } from 'react';
import { twMerge } from 'tailwind-merge';
import { ImageAsset, NovelAsset } from '@/types/collection';

import { ImageView } from './ImageView';
import { TextNovelDocument } from './TextNovelDocument';
import { EpubNovelDocument } from './EpubNovelView';

export interface NovelViewProps extends HTMLAttributes<HTMLDivElement> {
  asset: NovelAsset;
  coverAsset?: ImageAsset;
}

export const NovelView: FC<NovelViewProps> = ({ asset, coverAsset, ...divProps }) => (
  <div
    {...divProps}
    className={twMerge(divProps.className, 'mx-1 flex flex-col overflow-y-scroll py-3')}
  >
    {coverAsset && <ImageView asset={coverAsset} className="h-1/2 min-h-[50%]" />}

    {asset?.path.endsWith('.txt') && <TextNovelDocument asset={asset} className="z-30 grow" />}
    {asset?.path.endsWith('.epub') && <EpubNovelDocument asset={asset} className="z-30 grow" />}
  </div>
);
