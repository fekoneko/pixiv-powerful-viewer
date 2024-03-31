import WorksList from './WorksList';
import WorkPreview from './WorkPreview';

const WorksViewer = () => {
  return (
    <div className="flex gap-2">
      <WorksList />
      <WorkPreview />
    </div>
  );
};
export default WorksViewer;
