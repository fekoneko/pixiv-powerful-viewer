import Header from './components/layout/Header/Header';
import WorksViewer from './components/layout/WorkViewer/WorksViewer';
import { CollectionProvider } from './contexts/CollectionContext';

const App = () => {
  return (
    <CollectionProvider>
      <div className="flex flex-col w-screen h-dvh">
        <Header />
        <div className="grow">
          <WorksViewer />
        </div>
      </div>
    </CollectionProvider>
  );
};

export default App;
