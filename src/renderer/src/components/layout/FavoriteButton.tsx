import SearchContext from '@renderer/contexts/SearchContext';
import useKeyboardEvent from '@renderer/hooks/useKeyboardEvent';
import { useCallback, useContext, useEffect, useState } from 'react';

const FavoriteButton = () => {
  const { search, setSearch } = useContext(SearchContext);
  const [prevSearchRequest, setPrevSearchRequest] = useState('');

  const toggleFavorites = useCallback(
    () =>
      setSearch((prev) => ({
        request: prev?.request === '#favorites' ? prevSearchRequest : '#favorites',
        mode: prev?.mode ?? 'all',
      })),
    [setSearch, prevSearchRequest],
  );

  useEffect(() => {
    if (!search || search.request === '#favorites') return;
    setPrevSearchRequest(search.request);
  }, [search, setPrevSearchRequest]);

  useKeyboardEvent(
    'keyup',
    'Enter',
    (e) => {
      if (document.activeElement?.tagName === 'INPUT') return;
      e.preventDefault();

      toggleFavorites();
    },
    [toggleFavorites],
    { control: true },
  );

  return (
    <button
      role="button"
      onClick={toggleFavorites}
      className="rounded-full px-[0.58rem] py-2 text-lg hover:bg-text/10 focus:bg-text/10 focus:outline-none"
    >
      {search?.request === '#favorites' ? '❌' : '⭐'}
    </button>
  );
};
export default FavoriteButton;
