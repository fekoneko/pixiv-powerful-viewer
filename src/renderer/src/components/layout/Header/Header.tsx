import Searchbar from './Searchbar';
import CollectionButton from './CollectionButton';
import { Theme } from '@renderer/App';
import ThemeButton from './ThemeButton';

interface HeaderProps {
  theme: Theme;
  setTheme: React.Dispatch<React.SetStateAction<Theme>>;
}
const Header = ({ theme, setTheme }: HeaderProps) => {
  return (
    <header className="z-10 flex min-h-[3.2rem] items-center gap-2 whitespace-nowrap bg-primary px-[10%] py-1 text-text-header shadow-md">
      <div className="flex grow items-center gap-1 text-xl font-semibold">
        <h1 role="banner" className="mr-2 whitespace-nowrap">
          Pixiv Powerful Viewer
        </h1>
        <span>/</span>
        <CollectionButton />
      </div>
      <div className="grow basis-0">
        <Searchbar />
      </div>
      <ThemeButton theme={theme} setTheme={setTheme} />
    </header>
  );
};
export default Header;
