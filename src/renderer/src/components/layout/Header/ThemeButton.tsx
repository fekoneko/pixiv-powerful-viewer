import { Theme } from '@renderer/App';

interface ThemeButtonProps {
  theme: Theme;
  setTheme: React.Dispatch<React.SetStateAction<Theme>>;
}
const ThemeButton = ({ theme, setTheme }: ThemeButtonProps) => {
  return (
    <button
      onClick={() => setTheme((prev) => (prev === 'light' ? 'dark' : 'light'))}
      className="rounded-full p-2 hover:bg-text-header/20 focus:bg-text-header/20 focus:outline-none"
    >
      {theme}
    </button>
  );
};
export default ThemeButton;
