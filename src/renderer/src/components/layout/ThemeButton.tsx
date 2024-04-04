import { Theme } from '@renderer/App';

interface ThemeButtonProps {
  theme: Theme;
  setTheme: React.Dispatch<React.SetStateAction<Theme>>;
}
const ThemeButton = ({ theme, setTheme }: ThemeButtonProps) => {
  return (
    <button
      onClick={() => setTheme((prev) => (prev === 'light' ? 'dark' : 'light'))}
      className="rounded-full px-[0.58rem] py-2 text-lg hover:bg-text/10 focus:bg-text/10 focus:outline-none"
    >
      {theme === 'light' ? '💡' : '🌙'}
    </button>
  );
};
export default ThemeButton;
