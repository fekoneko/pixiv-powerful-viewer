import WorksList from './WorksList';
import WorkPreview from './WorkPreview';

const WorksViewer = () => {
  return (
    <div className="grid grid-cols-2 gap-2 size-full">
      <WorksList />
      <WorkPreview />
    </div>
  );
};
export default WorksViewer;
