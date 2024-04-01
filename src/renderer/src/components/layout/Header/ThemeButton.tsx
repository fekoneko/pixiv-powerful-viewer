import { Theme } from '@renderer/App';

interface ThemeButtonProps {
  theme: Theme;
  setTheme: React.Dispatch<React.SetStateAction<Theme>>;
}
const ThemeButton = ({ theme, setTheme }: ThemeButtonProps) => {
  return (
    <button onClick={() => setTheme((prev) => (prev === 'light' ? 'dark' : 'light'))}>
      {theme}
    </button>
  );
};
export default ThemeButton;
