import { FC } from 'react';
import { FullscreenState } from '@/hooks/use-fullscreen';
import { twMerge } from 'tailwind-merge';
import { Work } from '@/types/collection';

import { NovelWorkViewer } from './NovelWorkViewer';
import { ImageWorkViewer } from './ImageWorkViewer';

interface WorkViewerPanelProps {
  work: Work | null;
  fullscreenState: FullscreenState;
}

export const WorkViewerPanel: FC<WorkViewerPanelProps> = ({ work, fullscreenState }) => (
  <div
    className={twMerge(
      'relative z-20 flex grow basis-0 items-center justify-center overflow-hidden border border-border bg-paper shadow-lg',
      fullscreenState !== 'fullscreen' && 'rounded-lg',
    )}
  >
    {!work ? (
      <></>
    ) : work.novelAsset ? (
      <NovelWorkViewer work={work} />
    ) : (
      <ImageWorkViewer work={work} />
    )}
  </div>
);
