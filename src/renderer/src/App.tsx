import { useEffect, useState } from 'react';
import Header from './components/layout/Header/Header';
import WorksViewer from './components/layout/WorksViewer/WorksViewer';
import { CollectionProvider } from './contexts/CollectionContext';
import { SearchProvider } from './contexts/SearchContext';
import ThemeButton from './components/layout/ThemeButton';

export type Theme = 'light' | 'dark';

const App = () => {
  const [theme, setTheme] = useState<Theme>();

  useEffect(() => {
    if (theme === undefined) {
      setTheme(localStorage.getItem('theme') === 'dark' ? 'dark' : 'light');
    }
  }, [theme]);

  useEffect(() => {
    if (theme !== undefined) {
      localStorage.setItem('theme', theme);
    }
  }, [theme]);

  return (
    <CollectionProvider>
      <SearchProvider>
        <div
          data-theme={theme ?? 'light'}
          className="flex size-full flex-col overflow-hidden bg-background text-text transition-colors"
        >
          <Header />
          <main className="grow overflow-hidden pl-[calc(10%-1rem)] pr-[10%]">
            <WorksViewer />
          </main>

          <div className="absolute bottom-2 right-2">
            <ThemeButton theme={theme} setTheme={setTheme} />
          </div>
        </div>
      </SearchProvider>
    </CollectionProvider>
  );
};

export default App;
