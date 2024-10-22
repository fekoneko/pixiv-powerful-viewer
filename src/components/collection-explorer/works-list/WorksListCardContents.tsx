import { Fragment } from 'react/jsx-runtime';
import { ImageView } from '@/components/common/ImageView';
import { Work } from '@/types/collection';
import { FC, memo } from 'react';
import { convertFileSrc } from '@tauri-apps/api/core';

export interface WorksListCardContentProps {
  work: Work;
}

export const WorksListCardContent: FC<WorksListCardContentProps> = memo(({ work }) => (
  <>
    {!!work.imageAssets?.length && (
      <div className="relative size-full">
        <div className="relative flex size-full items-center transition-all [clip-path:rect(0_100%_100%_0_round_0.5rem)] hover:z-20 hover:translate-x-1 hover:[clip-path:rect(-100%_300%_300%_-100%_round_0.5rem)]">
          <ImageView
            src={convertFileSrc(work.imageAssets[0].path)}
            width={work.imageAssets[0].dimensions.width}
            height={work.imageAssets[0].dimensions.height}
            className="pointer-events-none absolute w-full rounded-lg transition-transform [:hover>&]:scale-[1.2] [:hover>&]:shadow-md"
          />
        </div>
        <p className="absolute right-0 top-0 -mr-2 -mt-0.5 rounded-lg bg-paper px-2 text-text shadow-md transition-colors [:hover>&]:invisible">
          x{work.imageAssets.length}
        </p>
      </div>
    )}
    {!work.imageAssets?.length && <div />}

    <div className="text-overflow-mask overflow-hidden p-2 text-left">
      <h2 className="whitespace-nowrap text-lg font-bold text-text-accent">
        {work.title ?? 'Untitled'}
      </h2>
      <p className="mb-2 whitespace-nowrap text-sm font-semibold">
        {work.userName ?? 'Unknown author'}
      </p>
      <p className="whitespace-nowrap text-sm">
        {!!work.tags?.length &&
          work.tags.map((tag, index) => (
            <Fragment key={index}>
              {index !== 0 && <span className="opacity-50">・</span>}
              <wbr />
              <span>{tag}</span>
            </Fragment>
          ))}
        {!work.tags?.length && <span>No tags</span>}
      </p>
    </div>
  </>
));
