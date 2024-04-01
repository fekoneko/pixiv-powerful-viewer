import Searchbar from './Searchbar';
import CollectionSelector from './CollectionSelector';
import { Theme } from '@renderer/App';
import ThemeButton from './ThemeButton';

interface HeaderProps {
  theme: Theme;
  setTheme: React.Dispatch<React.SetStateAction<Theme>>;
}
const Header = ({ theme, setTheme }: HeaderProps) => {
  return (
    <header className="flex px-[10%] min-h-[3.2rem] bg-primary text-text-header items-center shadow-md gap-2 whitespace-nowrap z-10">
      <div className="grow flex items-baseline gap-4 font-semibold text-xl">
        <h1 role="banner" className="whitespace-nowrap">
          Pixiv Powerful Viewer
        </h1>
        <span>/</span>
        <CollectionSelector />
      </div>
      <div className="grow">
        <Searchbar />
      </div>
      <ThemeButton theme={theme} setTheme={setTheme} />
    </header>
  );
};
export default Header;
