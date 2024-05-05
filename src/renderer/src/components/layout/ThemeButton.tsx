import { Theme } from '@renderer/App';
import { Dispatch, SetStateAction } from 'react';

interface ThemeButtonProps {
  theme: Theme | undefined;
  setTheme: Dispatch<SetStateAction<Theme | undefined>>;
}
const ThemeButton = ({ theme, setTheme }: ThemeButtonProps) => {
  return (
    <button
      onClick={() => setTheme((prev) => (prev === 'light' ? 'dark' : 'light'))}
      className="rounded-full px-[0.58rem] py-2 text-lg hover:bg-text/10 focus:bg-text/10 focus:outline-none"
    >
      {theme === 'dark' ? '🌙' : '💡'}
    </button>
  );
};
export default ThemeButton;
