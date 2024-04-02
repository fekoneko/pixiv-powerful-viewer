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
        'grid grid-cols-[3fr_8fr] shadow-md gap-2 border-2 border-text/30 rounded-xl p-1 items-center' +
        (active ? ' bg-text/10' : '')
      }
    >
      {work.assets?.length ? (
        <div className="size-full overflow-hidden hover:overflow-visible hover:shadow-md [&>img]:hover:[transform:scale(1.2)] [&>p]:hover:invisible hover:z-20 relative rounded-lg flex items-center">
          <img
            src={work.assets[0].mediaPath}
            className="absolute w-full rounded-lg transition-transform"
          />
          <p className="absolute top-0 right-0 text-white">x{work.assets.length}</p>
        </div>
      ) : (
        <div />
      )}
      <div className="overflow-hidden p-2 text-left">
        <h2 className="whitespace-nowrap text-lg font-bold text-text-accent">
          {work.title ?? 'Untitled'}
        </h2>
        <p className="whitespace-nowrap text-sm font-semibold mb-2">
          {work.userName ?? 'Unknown author'}
        </p>
        <p className="text-sm whitespace-nowrap">
          {work.tags?.map((tag, index) => (
            <Fragment key={tag}>
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
