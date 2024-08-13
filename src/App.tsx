import { FC } from 'react';

import { ThemeProvider } from '@/providers/ThemeProvider';
import { OutputProvider } from '@/providers/OutputProvider';
import { CollectionProvider } from '@/providers/CollectionProvider';
import { SearchQueryProvider } from '@/providers/SearchQueryProvider';

import { Header } from '@/components/header';
import { Sidebar } from '@/components/sidebar';
import { CollectionExplorer } from '@/components/collection-explorer';
import { useKeyboardEvent } from '@/hooks';
import { appWindow } from '@tauri-apps/api/window';

export const App: FC = () => {
  useKeyboardEvent('keydown', 'F11', async () => {
    const isFullscreen = await appWindow.isFullscreen();
    appWindow.setFullscreen(!isFullscreen);
  });

  return (
    <ThemeProvider>
      <OutputProvider>
        <CollectionProvider>
          <SearchQueryProvider>
            <div className="grid size-full grid-rows-[3rem_1fr] bg-background text-text transition-colors">
              <Header />

              <div className="grid grid-cols-[3.5rem_1fr_3.5rem] overflow-hidden px-3">
                <Sidebar />
                <CollectionExplorer />
                <div />
              </div>
            </div>
          </SearchQueryProvider>
        </CollectionProvider>
      </OutputProvider>
    </ThemeProvider>
  );
};
