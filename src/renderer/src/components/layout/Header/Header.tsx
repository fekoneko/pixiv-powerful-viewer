import Searchbar from './Searchbar';
import CollectionSelector from './CollectionSelector';

const Header = () => {
  return (
    <header className="flex">
      <h1 role="banner" className="grow">
        Pixiv Powerful Viewer
      </h1>
      <CollectionSelector />
      <div className="grow">
        <Searchbar />
      </div>
    </header>
  );
};
export default Header;
