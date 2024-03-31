import useWorks from '../../../hooks/useWorks';
import { memo } from 'react';
import WorkCard from './WorkCard';

const WorksList = () => {
  const works = useWorks((error) => console.log(error));

  return (
    <div>
      {works.map((work) => (
        <WorkCard key={work.id} work={work} />
      ))}
    </div>
  );
};
export default memo(WorksList);
