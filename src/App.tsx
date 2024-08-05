import { FC } from 'react';

import { ThemeProvider } from '@/providers/ThemeProvider';
import { OutputProvider } from '@/providers/OutputProvider';
import { CollectionProvider } from '@/providers/CollectionProvider';
import { SearchQueryProvider } from '@/providers/SearchQueryProvider';

import { Header } from '@/components/header';
import { CollectionExplorer } from '@/components/collection-explorer';
import { FavoriteButton, ThemeButton } from '@/components/hover-buttons';
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
            <Header />

            <CollectionExplorer />

            <FavoriteButton />
            <ThemeButton />
          </SearchQueryProvider>
        </CollectionProvider>
      </OutputProvider>
    </ThemeProvider>
  );
};
