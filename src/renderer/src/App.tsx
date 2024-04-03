import { useState } from 'react';
import Header from './components/layout/Header/Header';
import WorksViewer from './components/layout/WorksViewer/WorksViewer';
import { CollectionProvider } from './contexts/CollectionContext';
import { SearchProvider } from './contexts/SearchContext';

export type Theme = 'light' | 'dark';

const App = () => {
  const [theme, setTheme] = useState<Theme>('light');

  return (
    <CollectionProvider>
      <SearchProvider>
        <div
          data-theme={theme}
          className="flex h-dvh w-screen flex-col overflow-hidden bg-background text-text"
        >
          <Header theme={theme} setTheme={setTheme} />
          <main className="grow overflow-hidden pl-[calc(10%-1rem)] pr-[10%]">
            <WorksViewer />
          </main>
        </div>
      </SearchProvider>
    </CollectionProvider>
  );
};

export default App;
