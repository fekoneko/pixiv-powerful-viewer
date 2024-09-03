import { FC, HTMLAttributes } from 'react';
import { twMerge } from 'tailwind-merge';
import { NovelAsset } from '@/types/collection';

import { TextNovelDocument } from './TextNovelDocument';
import { EpubNovelDocument } from './EpubNovelView';

export interface NovelViewProps extends HTMLAttributes<HTMLDivElement> {
  asset: NovelAsset;
}

export const NovelView: FC<NovelViewProps> = ({ asset, ...divProps }) => (
  <div {...divProps} className={twMerge(divProps.className, 'mx-1')}>
    {asset?.path.endsWith('.txt') && <TextNovelDocument asset={asset} className="z-30 size-full" />}
    {asset?.path.endsWith('.epub') && (
      <EpubNovelDocument asset={asset} className="z-30 size-full" />
    )}
  </div>
);
