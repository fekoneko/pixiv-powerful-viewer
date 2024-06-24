import Searchbar from '@renderer/components/layout/header/Searchbar';
import CollectionButton from '@renderer/components/layout/header/CollectionButton';

const Header = () => {
  return (
    <header className="z-10 flex min-h-[3.2rem] items-center gap-1 whitespace-nowrap bg-primary px-[10%] py-1 text-text-header shadow-md">
      <div className="flex grow items-center gap-1 text-xl font-semibold">
        <h1 role="banner" className="mr-2 whitespace-nowrap">
          Pixiv Powerful Viewer
        </h1>
        <span>/</span>
        <CollectionButton />
      </div>
      <Searchbar />
    </header>
  );
};
export default Header;
