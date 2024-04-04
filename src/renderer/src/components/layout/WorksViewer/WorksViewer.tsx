import WorksList from './WorksList';
import WorkPreview from './WorkPreview';
import { useState } from 'react';
import { Work } from '@renderer/lib/Collection';
import WorkDetails from './WorkDetails';

const WorksViewer = () => {
  const [selectedWork, setSelectedWork] = useState<Work>();

  return (
    <div className="grid size-full grid-cols-2 grid-rows-1 gap-2">
      <WorksList selectWork={setSelectedWork} />
      <div className="flex flex-col gap-2 py-2">
        <WorkPreview work={selectedWork} />
        <WorkDetails work={selectedWork} />
      </div>
    </div>
  );
};
export default WorksViewer;
