import { FavoritesButton } from '@/components/sidebar/FavoritesButton';
import { OutputButton } from '@/components/sidebar/OutputButton';
import { ThemeButton } from '@/components/sidebar/ThemeButton';
import { FC } from 'react';

export const Sidebar: FC = () => (
  <aside className="flex flex-col justify-end gap-2 p-2">
    <FavoritesButton />
    <ThemeButton />
    <OutputButton />
  </aside>
);
