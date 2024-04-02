import WorksList from './WorksList';
import WorkPreview from './WorkPreview';
import { useState } from 'react';
import { Work } from '@renderer/lib/Collection';

const WorksViewer = () => {
  const [selectedWork, setSelectedWork] = useState<Work>();

  return (
    <div className="grid size-full grid-cols-2 gap-2">
      <WorksList selectWork={setSelectedWork} />
      <WorkPreview work={selectedWork} />
    </div>
  );
};
export default WorksViewer;
