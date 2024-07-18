import { Searchbar } from '@/components/layout/header/Searchbar';
import { CollectionButton } from '@/components/layout/header/CollectionButton';
import { FC } from 'react';

export const Header: FC = () => {
  return (
    <header className="bg-primary text-text-header z-10 flex min-h-[3.2rem] items-center gap-1 whitespace-nowrap px-[10%] py-1 shadow-md">
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
};
