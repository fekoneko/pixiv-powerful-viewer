import useWorks from '../../../hooks/useWorks';
import { memo, useState } from 'react';
import WorkCard from './WorkCard';
import { Work } from '@renderer/lib/Collection';

interface WorkListCardsProps {
  works: Work[];
}
const WorkListCards = memo(({ works }: WorkListCardsProps) => {
  console.log('render');

  return (
    <>
      {works.map((work) => (
        <WorkCard key={work.id} work={work} />
      ))}
    </>
  );
});

const WorksList = () => {
  const works = useWorks((error) => console.error(error));
  const [scrolledToTheTop, setScrolledToTheTop] = useState(true);
  const [scrolledToTheBottom, setScrolledToTheBottom] = useState(true);

  return (
    <div
      className={
        (!scrolledToTheTop ? 'work-list-gradient-top ' : '') +
        (!scrolledToTheBottom ? 'work-list-gradient-bottom ' : '') +
        'grow flex flex-col overflow-hidden'
      }
    >
      <div
        className="overflow-y-scroll pl-2 [direction:rtl] grow"
        onScroll={(e) => {
          const target = e.target as HTMLDivElement;
          if (target.scrollTop < 10) setScrolledToTheTop(true);
          else setScrolledToTheTop(false);
          if (target.scrollTop + target.getBoundingClientRect().height > target.scrollHeight - 10)
            setScrolledToTheBottom(true);
          else setScrolledToTheBottom(false);
        }}
      >
        <div className="[direction:ltr] flex flex-col gap-2 py-2">
          <WorkListCards works={works} />
        </div>
      </div>
    </div>
  );
};
export default memo(WorksList);
