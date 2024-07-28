import { useTheme } from '@/hooks/use-theme';
import { FC } from 'react';

export const ThemeButton: FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="focus:bg-paper/80 hover:bg-paper/80 absolute bottom-2 right-2 rounded-full px-[0.58rem] py-2 text-lg focus:outline-none"
    >
      {theme === 'dark' ? '🌙' : '💡'}
    </button>
  );
};
