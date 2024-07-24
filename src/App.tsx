import { Header } from '@/components/layout/header/Header';
import { WorksViewer } from '@/components/layout/works-viewer/WorksViewer';
import { CollectionProvider } from '@/contexts/CollectionContext';
import { SearchProvider } from '@/contexts/SearchContext';
import { ThemeButton } from '@/components/layout/ThemeButton';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { FC, useCallback } from 'react';

export type Theme = 'light' | 'dark';

export const App: FC = () => {
  const [theme, setTheme] = useLocalStorage<Theme>(
    'theme',
    useCallback((error: unknown) => console.error(error), []),
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
