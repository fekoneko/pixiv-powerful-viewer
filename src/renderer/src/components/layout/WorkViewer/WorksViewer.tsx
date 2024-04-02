import WorksList from './WorksList';
import WorkPreview from './WorkPreview';
import { useState } from 'react';
import { Work } from '@renderer/lib/Collection';

const WorksViewer = () => {
  const [selectedWork, setSelectedWork] = useState<Work>();

  return (
    <div className="grid grid-cols-2 gap-2 size-full">
      <WorksList selectWork={setSelectedWork} />
      <WorkPreview work={selectedWork} />
    </div>
  );
};
export default WorksViewer;
