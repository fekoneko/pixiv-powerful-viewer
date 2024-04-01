import { useState } from 'react';
import Header from './components/layout/Header/Header';
import WorksViewer from './components/layout/WorkViewer/WorksViewer';
import { CollectionProvider } from './contexts/CollectionContext';

export type Theme = 'light' | 'dark';

const App = () => {
  const [theme, setTheme] = useState<Theme>('light');

  return (
    <CollectionProvider>
      <div
        data-theme={theme}
        className="flex flex-col w-screen h-dvh overflow-hidden bg-background text-text"
      >
        <Header theme={theme} setTheme={setTheme} />
        <main className="grow overflow-hidden pl-[calc(10%-1rem)] pr-[10%]">
          <WorksViewer />
        </main>
      </div>
    </CollectionProvider>
  );
};

export default App;
