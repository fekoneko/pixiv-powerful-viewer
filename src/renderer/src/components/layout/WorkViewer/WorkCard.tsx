import { Fragment } from 'react/jsx-runtime';
import { Work } from '../../../lib/Collection';
import { memo } from 'react';

interface WorkCardProps {
  work: Work;
  select: () => any;
  active?: boolean;
}
const WorkCard = ({ work, select, active }: WorkCardProps) => {
  return (
    <button
      onClick={select}
      className={
        'grid grid-cols-[3fr_8fr] items-center gap-2 rounded-xl border-2 border-text/30 p-1 shadow-md focus:border-text/60 focus:outline-none' +
        (active ? ' bg-text/20' : ' hover:bg-text/10 focus:bg-text/10')
      }
    >
      {work.assets?.length ? (
        <div className="relative flex size-full items-center overflow-hidden rounded-lg hover:z-20 hover:overflow-visible hover:shadow-md [&>img]:hover:[transform:scale(1.2)] [&>p]:hover:invisible">
          <img
            src={work.assets[0]?.mediaPath}
            className="absolute w-full rounded-lg transition-transform"
          />
          <p className="absolute right-0 top-0 text-white">x{work.assets.length}</p>
        </div>
      ) : (
        <div />
      )}
      <div className="overflow-hidden p-2 text-left">
        <h2 className="whitespace-nowrap text-lg font-bold text-text-accent">
          {work.title ?? 'Untitled'}
        </h2>
        <p className="mb-2 whitespace-nowrap text-sm font-semibold">
          {work.userName ?? 'Unknown author'}
        </p>
        <p className="whitespace-nowrap text-sm">
          {work.tags?.map((tag, index) => (
            <Fragment key={index}>
              {index !== 0 && <span className="opacity-50">・</span>}
              <wbr />
              <span>{tag}</span>
            </Fragment>
          )) ?? <p>no tags</p>}
        </p>
      </div>
    </button>
  );
};
export default memo(WorkCard);
