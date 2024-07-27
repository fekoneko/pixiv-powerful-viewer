import { useTheme } from '@/hooks/use-theme';
import { FC } from 'react';

export const ThemeButton: FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="absolute bottom-2 right-2 rounded-full px-[0.58rem] py-2 text-lg hover:bg-text/10 focus:bg-text/10 focus:outline-none"
    >
      {theme === 'dark' ? '🌙' : '💡'}
    </button>
  );
};
