import { useTheme } from '@/hooks/use-theme';
import { FC } from 'react';

export const ThemeActionButton: FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      tabIndex={2}
      className="order-2 flex size-10 items-center justify-center rounded-md border border-border bg-paper px-[0.58rem] py-2 text-lg shadow-md hover:bg-paper-hover focus:bg-paper-hover focus:outline-none"
    >
      {theme === 'dark' ? '🌙' : '💡'}
    </button>
  );
};
