import { Fragment } from 'react/jsx-runtime';
import { Work } from '../../../lib/Collection';

interface WorkCardProps {
  work: Work;
}
const WorkCard = ({ work }: WorkCardProps) => {
  return (
    <figure className="grid grid-cols-[3fr_8fr] shadow-md gap-2 border-2 p-2 border-text/30 rounded">
      {work.assets?.length ? <img /> : <div />}
      <div className="overflow-hidden">
        <figcaption className="whitespace-nowrap font-bold text-text-accent">
          {work.title ?? 'Untitled'}
        </figcaption>
        <p className="whitespace-nowrap text-sm font-semibold mb-1">
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
    </figure>
  );
};
export default WorkCard;
