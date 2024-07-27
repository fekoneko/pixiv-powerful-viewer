import { FC } from 'react';

import { CollectionProvider } from '@/providers/CollectionProvider';
import { SearchProvider } from '@/providers/SearchProvider';

import { Header } from '@/components/header';
import { CollectionExplorer } from '@/components/collection-explorer';
import { FavoriteButton, ThemeButton } from '@/components/hover-buttons';
import { ThemeProvider } from '@/providers/ThemeProvider';

export const App: FC = () => (
  <ThemeProvider>
    <CollectionProvider>
      <SearchProvider>
        <Header />

        <CollectionExplorer />

        <FavoriteButton />
        <ThemeButton />
      </SearchProvider>
    </CollectionProvider>
  </ThemeProvider>
);
