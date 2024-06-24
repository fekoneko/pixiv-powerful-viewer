import Header from '@renderer/components/layout/Header/Header';
import WorksViewer from '@renderer/components/layout/WorksViewer/WorksViewer';
import { CollectionProvider } from '@renderer/contexts/CollectionContext';
import { SearchProvider } from '@renderer/contexts/SearchContext';
import ThemeButton from '@renderer/components/layout/ThemeButton';
import useLocalStorage from '@renderer/hooks/useLocalStorage';
import { useCallback } from 'react';

export type Theme = 'light' | 'dark';

const App = () => {
  const [theme, setTheme] = useLocalStorage<Theme>(
    'theme',
    useCallback((error) => console.error(error), []),
  );

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
