import { FavoritesButton } from '@/components/sidebar/FavoritesButton';
import { OutputButton } from '@/components/sidebar/OutputButton';
import { ThemeButton } from '@/components/sidebar/ThemeButton';
import { FC } from 'react';

export const Sidebar: FC = () => (
  <aside className="flex flex-col justify-end gap-2 py-2">
    <ThemeButton />
    <FavoritesButton />
    <OutputButton />
  </aside>
);
