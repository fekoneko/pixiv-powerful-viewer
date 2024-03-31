import { Work } from '../../../lib/Collection';

interface WorkCardProps {
  work: Work;
}
const WorkCard = ({ work }: WorkCardProps) => {
  return (
    <figure className="flex gap-2 border border-black">
      {work.assets?.length ? <img /> : <div />}
      <div>
        <figcaption>{work.title ?? 'Untitled'}</figcaption>
        <p>{work.userName ?? 'Unknown author'}</p>
        <p>{work.tags?.join('  |  ') ?? 'no tags'}</p>
      </div>
    </figure>
  );
};
export default WorkCard;
