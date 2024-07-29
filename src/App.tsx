import { FC } from 'react';

import { ThemeProvider } from '@/providers/ThemeProvider';
import { OutputProvider } from '@/providers/OutputProvider';
import { CollectionProvider } from '@/providers/CollectionProvider';
import { SearchProvider } from '@/providers/SearchProvider';

import { Header } from '@/components/header';
import { CollectionExplorer } from '@/components/collection-explorer';
import { FavoriteButton, ThemeButton } from '@/components/hover-buttons';

export const App: FC = () => (
  <ThemeProvider>
    <OutputProvider>
      <CollectionProvider>
        <SearchProvider>
          <Header />

          <CollectionExplorer />

          <FavoriteButton />
          <ThemeButton />
        </SearchProvider>
      </CollectionProvider>
    </OutputProvider>
  </ThemeProvider>
);
