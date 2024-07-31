import { FC } from 'react';

import { Searchbar } from './Searchbar';
import { CollectionButton } from './CollectionButton';

export const Header: FC = () => (
  <header className="z-10 flex min-h-[3.2rem] items-center gap-1 whitespace-nowrap bg-primary px-[8%] py-1 text-text-header shadow-md">
    <div className="flex grow items-center gap-1 text-xl font-semibold">
      <h1 role="banner" className="mr-2 whitespace-nowrap">
        Pixiv Powerful Viewer
      </h1>
      <span>/</span>
      <CollectionButton />
    </div>
    <Searchbar />
  </header>
);
